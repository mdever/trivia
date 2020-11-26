let { APIError, ErrorSubTypes } = require('./api-errors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports = function(app, {User, Room, UserSessions, Question, Answer, Game, AuthToken}) {

  async function checkUser(req, res, next) {
    const errorResponse = new APIError();

    let authToken = req.headers.authorization;
    if (!authToken) {
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.AUTHORIZATION_MISSING, 'Authorization header not present');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.write(errorResponse.getErrorResponse());
      res.end();
  
      return;
    }
    authToken = authToken.slice(7);
    authToken = await AuthToken.findOne({where: { value: authToken }});
  
    if (!authToken) {
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.SESSION_NOT_FOUND, "No session found for Bearer token")
    }
  
    if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }
  
  
    const user = await User.findOne({ where: { id: authToken.userId } })
  
    if (!user) {
        errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.USER_NOT_FOUND, "No user found for Bearer token")
    }
  
    if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }
  
    req.user = user;
  
    next();
  }


  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.post('/users', async (req, res) => {
    const {username, password} = req.body;
    
    bcrypt.genSalt(10, async (err1, salt) => {

      if (err1) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({type: 'CRYPTO_ERROR', message: 'Failure to generate salt', detail: JSON.stringify(err1)}));
        res.end();
        
        return;
      }

      bcrypt.hash(password, salt, async (err2, pwHash) => {

        if (err2) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.write(JSON.stringify({type: 'CRYPTO_ERROR', message: 'Failure to hash password', detail: JSON.stringify(err2)}));
          res.end();
          
          return;
        }  

        const user = User.build({ username, salt, pwHash });
        await user.save();

        const token = crypto.randomBytes(48).toString('hex');

        const authToken = AuthToken.build({
          value: token
        })

        await authToken.save();
        await user.setAuthToken(authToken);

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ token, id: user.id, username: user.username }));
        res.end();
      });
    });
  })

  app.post('/tokens', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({type: 'AUTHENTICATION_ERROR', message: 'Could not validate username/password'}));
      res.end();
    }

    const match = await bcrypt.compare(password, user.pwHash);
    if (match) {

      let existingSessions = AuthToken.findAll({where: { userId: user.id }});
      for (let i = 0; i++; i < existingSessions.length) {
        await existingSessions[i].destroy();
      }

      const token = crypto.randomBytes(48).toString('hex');
      authToken = AuthToken.build({
        value: token
      });

      await authToken.save();
      await user.setAuthToken(authToken);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({ token, username: user.username, id: user.id }));
      res.end();

    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({type: 'AUTHENTICATION_ERROR', message: 'Could not validate username/password'}));
      res.end();
    }
  });

  app.delete('/tokens', async (req, res) => {
    const errorResponse = new APIError();

    let authToken = req.headers.authorization;
    if (!authToken) {
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.AUTHORIZATION_MISSING, 'Authorization header not present');
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.write(errorResponse.getErrorResponse());
      res.end();

      return;
    }
    authToken = authToken.slice(7);
    authToken = await AuthToken.findOne({where: { value: authToken }});

    if (!authToken) {
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.SESSION_NOT_FOUND, "No session found for Bearer token")
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }

    await authToken.destroy();

    res.writeHead(200);
    res.end();
  });

  app.post('/rooms', async (req, res) => {
    const room = Room.build({ name: req.body.name });
    const game = await Game.findOne({ id: req.body.gameId });
    room.setGame(game);
    await room.save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({...room.dataValues}));
    res.end();
  });

  app.post('/questions', checkUser, async (req, res) => {
    const errorResult = new APIError();

    if (!req.body.gameId) {
      errorResult.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
        name: 'gameId',
        reason: 'not present',
        location: 'BODY'
      }]);
    }

    if (!req.body.questions) {
      errorResult.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT), [{
        name: 'questions',
        reason: 'not present',
        location: 'BODY'
      }]
    }

    if (errorResult.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResult.getErrorResponse());
      res.send();
    }

    const gameId = Number(req.body.gameId);

    if (isNaN(gameId)) {
      errorResult.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE), [{
        name: 'gameId',
        reason: 'Not an integer',
        location: 'BODY'
      }];
    }

    if (errorResult.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResult.getErrorResponse());
      res.send();
    }

    const user = req.user;

    const game = await Game.findByPk(gameId);

    if (!game) {
      errorResult.addValidationErrors(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
        name: 'gameId',
        value: req.body.gameId,
        reason: 'Game not found'
      }]);
    }

    if (errorResult.hasErrors()) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.write(errorResult.getErrorResponse());
      res.send();
    }

    if (game.ownerId != user.id) {
      errorResult.addAuthorizationError(ErrorSubTypes.AUTHORIZATION_ERROR.ACCESS_TO_RESOURCE_DENIED, 
        'Attempting to modify a game which is not owned by the authenticated user');
      res.writeHead(401, {'Content-Type': 'application/json'});
      res.write(errorResult.getErrorResponse());
      res.end();
      
      return;
    }

    for (let q of req.body.questions) {
      const question = Question.build({
        question: q.question,
        hint: q.hint,
        index: q.index
      })

      try {
        await question.save();
        await game.addQuestion(question);
      } catch (error) {
        console.log('Error assigning question to game');
        console.log(error);
      }

      for (let a of q.answers) {
        const answer = Answer.build({
          answer: a.answer,
          index: a.index,
          correct: a.correct
        })

        try {
          await answer.save();
          await question.addAnswer(answer);
        } catch (error) {
          console.log('Error assigning answer to question');
          console.log(error);
        }
      }
    }

    questions = await Question.findAll({where: { gameId: game.id }, include: Answer});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify([...questions]));
    res.end();

    return;
  });

  app.get('/questions', checkUser, async (req, res) => {

    const errorResponse = new APIError();

    if (!req.query.gameId) {
      errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
          name: 'gameId',
          reason: 'Not Present',
          location: 'QUERY'
      }]);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.send();
      
      return;
    }
    const gameId = Number(req.query.gameId);

    if (isNaN(gameId)) {
      errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE, [{
        name: 'gameId',
        reason: 'Not an integer',
        location: 'QUERY'
      }]);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.send();
      
      return;
    }

    const user = req.user;
    const game = await Game.findByPk(gameId);

    if (!game) {
      errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
          name: 'gameId',
          value: req.body.userId,
          reason: 'Game not found'
      }])
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(404, { 'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse())
      res.end();
      return;
    }

    if (game.ownerId !== user.id) {
      errorResponse.addAuthorizationError('UNAUTHORIZED_READ', [{
        name: 'gameId',
        reason: 'References an entity which is not owned by user'
      }]);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(401, { 'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.end();

      return;
    }

    const questions = await Question.findAll({ where: { gameId: game.id }, include: Answer })
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify([...questions]));
    res.end();

    return;

  });

  app.post('/games', checkUser, async (req, res) => {
    const errorResponse = new APIError();

    if (!req.body.name) {
        errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
            name: 'name', reason: 'not present', location: 'BODY'
        }]);
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse())
        res.end();
        return;
    }

    const user = req.user;

    const game = Game.build({
      name: req.body.name
    })

    try {
        await game.save();
        await user.addGame(game);
    } catch (error) {
        console.log('Error on game.save()');
        console.log(error);
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({ ...game.dataValues }));
    res.end();
  });

  
  app.get('/games', checkUser, async (req, res) => {
      const errorResponse = new APIError()

      const user = req.user;
      const games = await user.getGames();

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(games));
      res.end();
  });

  app.post('/sessions', async (req, res) => {
    let room = await Room.findByPk(req.body.roomId);
    console.log(JSON.stringify(room.dataValues));
    const user = await User.findByPk(req.body.userId);
    console.log(user.dataValues);

    room.addUser(user);

    room = await room.save();
    const session = await UserSessions.findOne({
      where: {
        [Op.and]: [
          { userId: user.id },
          { roomId: room.id }
        ]
      }
    });

    console.log('Created session: ');
    console.log(session);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(session.dataValues));
    res.end();
  });
}