let { APIError, ErrorSubTypes } = require('./api-errors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

module.exports = function(app, {User, Room, UserSessions, Question, Answer, Game, AuthToken}) {

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.post('/users', async (req, res) => {
    const {name, password} = req.body;
    
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
          res.write(JSON.stringify({type: 'CRYPTO_ERROR', message: 'Failure to generate salt', detail: JSON.stringify(err2)}));
          res.end();
          
          return;
        }  

        const user = User.build({ name, salt, pwHash });
        await user.save();

        const token = crypto.randomBytes(48).toString('hex');

        const authToken = AuthToken.build({
          value: token
        })

        await authToken.save();
        await user.setAuthToken(authToken);

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({ token }));
        res.end();
      });
    });
  })

  app.post('/tokens', async (req, res) => {
    const { name, password } = req.body;

    const user = await User.findOne({ where: { name } });
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
      res.write(JSON.stringify({ token: token }));
      res.end();

    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({type: 'AUTHENTICATION_ERROR', message: 'Could not validate username/password'}));
      res.end();
    }
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

  app.post('/questions', async (req, res) => {
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

    if (!req.body.userId) {
      errorResult.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT), [{
        name: 'userId',
        reason: 'not present',
        location: 'BODY'
      }]
    }

    if (errorResult.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResult.getErrorResponse());
      res.send();
    }

    const userId = Number(req.body.userId);
    const gameId = Number(req.body.gameId);

    if (isNaN(userId)) {
      errorResult.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE), [{
        name: 'userId',
        reason: 'Not an integer',
        location: 'BODY'
      }];
    }

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

    const user = await User.findByPk(userId);

    if (!user) {
      errorResult.addValidationErrors(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
        name: 'userId',
        value: req.body.userId,
        reason: 'User not found'
      }]);
    }

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

  app.get('/questions', async (req, res) => {

    const errorResponse = new APIError();

    if (!req.query.userId) {
      errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
          name: 'userId',
          reason: 'Not Present',
          location: 'QUERY'
      }]);
    }

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

    const userId = Number(req.query.userId);
    const gameId = Number(req.query.gameId);

    if (isNaN(userId)) {
      errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE, [{
        name: 'userId',
        reason: 'Not an integer',
        location: 'QUERY'
      }]);
    }

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

    const user = await User.findByPk(userId);
    const game = await Game.findByPk(gameId);

    if (!user) {
      errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
          name: 'userId',
          value: req.body.userId,
          reason: 'User not found'
      }])
    }

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

  app.post('/games', async (req, res) => {
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
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.NO_SESSION_FOUND, "No session found for Bearer token")
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }


    const user = await User.findOne({ where: { id: authToken.userId } })

    if (!user) {
        errorResponse.addAuthenticationError(ErrorSubTypes.AUTHENTICATION_ERROR.NO_SESSION_FOUND, "No session found for Bearer token")
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }

    const game = Game.build({
      name: req.body.name
    })

    user.addGame(game);

    try {
        await game.save();
    } catch (error) {
        console.log('Error on game.save()');
        console.log(error);
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({ ...game.dataValues }));
    res.end();
  });

  
  app.get('/games', async (req, res) => {
      const errorResponse = {
          errors: []
      }
      
      console.log(req.query);

      if (!req.query.userId) {
          errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
              name: 'userId',
              reason: 'Not Present',
              location: 'QUERY'
          }]);
      }

      if (isNaN(Number(req.query.userId))) {
          errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.INVALID_TYPE, [{
              name: 'userId',
              reason: 'Not an integer',
              location: 'QUERY'
          }]);
      }

      if (errorResponse.errors.length > 0) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(errorResponse));
          res.end();
          return;
      }

      const user = await User.findByPk(Number(req.query.userId));
      if (!user) {
          errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
              name: 'userId',
              value: userId,
              reason: 'User could not be found'
          }]);
      }

      if (errorResponse.errors.length > 0) {
          res.writeHead(404, {'Content-Type': 'application/json'});
          res.write(JSON.stringify(errorResponse));
          res.end();
          return;
      }

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