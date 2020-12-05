let { APIError, ErrorSubTypes } = require('./api-errors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const utils = require('./utils');
const { checkUser, validatesPresence } = require('./middleware')();
const { WSController } = require('./ws-controller');

const wsController = WSController.getInstance();

const {User, Room, UserSessions, Question, Answer, Game, AuthToken} = require('./models')()

module.exports = function(app) {

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

  app.post('/questions',
           checkUser,
           validatesPresence([
             {
                fieldName: 'gameId',
                location: 'BODY',
                type: 'number'
              }, {
                fieldName: 'questions',
                location: 'BODY',
                type: 'array'
              }]),
           async (req, res) => {

    const errorResult = new APIError();

    const gameId = Number(req.body.gameId);

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
      })

      if (req.body.index) {
        question.index = index;
      } else {
        const questions = await Question.findAll({where: { gameId }, order: [['index', 'DESC']]});
        if (questions.length > 0) {
          question.index = questions[0].index + 1;
        } else {
          question.index = 0;
        }
      }

      try {
        await question.save();
        await game.addQuestion(question);
      } catch (error) {
        console.log('Error assigning question to game');
        console.log(error);
      }

      if (a.answers) {
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
    }

    questions = await Question.findAll({where: { gameId: game.id }, include: Answer});
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify([...questions]));
    res.end();

    return;
  });

  app.get('/questions',
          checkUser,
          validatesPresence([{fieldName: 'gameId', location: 'QUERY', type: 'number'}]),
          async (req, res) => {

    const errorResponse = new APIError();

    const gameId = Number(req.query.gameId);


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

  app.post(
    '/answers', 
    checkUser,
    validatesPresence([
      {
        fieldName: 'questionId',
        location: 'BODY',
        type: 'number'
      }, 
      {
        fieldName: 'answer',
        location: 'BODY',
        type: 'string'
      },
      {
        fieldName: 'correct',
        location: 'BODY',
        type: 'boolean'
      }
    ]),
    async (req, res) => {
      const errorResponse = new APIError();
      
      let questionId = Number(req.body.questionId);

      const question = await Question.findByPk(questionId);

      if (!question) {
        errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
          name: 'questionId',
          value: questionId,
          reason: 'Question not found'
        }]);
      }

      if (errorResponse.hasErrors()) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse());
        res.end();

        return;
      }

      const game = await question.getGame();
      if (game.ownerId != req.user.id) {
        errorResponse.addAuthorizationError(ErrorSubTypes.AUTHORIZATION_ERROR.ACCESS_TO_RESOURCE_DENIED, 'Requested to add an answer to a question in a game not owned by user ' + req.user.username);
      }

      if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse());
        res.end();

        return;
      }

      const answer = Answer.build({
        answer: req.body.answer,
        correct: req.body.correct
      });

      if (req.body.index) {
        answer.index = req.body.index;
      } else {
        const answersForQuestion = await Answer.findAll({ where: { questionId: question.id }, order: [['index', 'DESC']] });
        let nextIndex;
        if (answersForQuestion.length > 0) {
          nextIndex = answersForQuestion[0].index + 1;
        } else {
          nextIndex = 0;
        }

        answer.index = nextIndex;
      }

      await answer.save();

      await question.addAnswer(answer);
      await answer.setQuestion(question);

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify({...answer.dataValues}));
      res.end();

      return;

    });

  app.delete('/answers/:id', checkUser, async (req, res) => {
    const errorResponse = new APIError();
    let id = req.params.id;
    if (!id) {
      errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
        name: 'id', reason: 'not present', location: 'PATH'
      }]);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.end();
      return;
    }

    let answer = await Answer.findByPk(id);
    if (!answer) {
      errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
        name: 'id',
        value: id,
        reason: 'Answer not found'
      }]);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.end();
      return;
    }

    let question = await answer.getQuestion();
    let game = await question.getGame();
    let user = await game.getUser();

    if (user.id != req.user.id) {
      errorResponse.addAuthenticationError(ErrorSubTypes.AUTHORIZATION_ERROR.ACCESS_TO_RESOURCE_DENIED, 'Answer not accessible by user ' + req.user.id);
    }

    if (errorResponse.hasErrors()) {
      res.writeHead(401, {'Content-Type': 'application/json'});
      res.write(errorResponse.getErrorResponse());
      res.end();
      return;
    }

    await answer.destroy();

    res.writeHead(200);
    res.end();

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

  app.post(
    '/rooms',
    checkUser,
    validatesPresence([
      {
        fieldName: 'gameId',
        location: 'BODY',
        type: 'number'
      }
    ]),
    async (req, res) => {
      const errorResponse = new APIError();

      const gameId = Number(req.body.gameId);

      const game = await Game.findByPk(gameId);
      if (!game) {
        errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
          name: 'gameId',
          value: req.body.gameId,
          reason: 'Game not found'
        }])
      }

      if (errorResponse.hasErrors()) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse());
        res.end();

        return;
      }

      if (req.user.id != game.ownerId) {
        errorResponse.addAuthorizationError(ErrorSubTypes.AUTHORIZATION_ERROR.ACCESS_TO_RESOURCE_DENIED, 'User ' + req.user.id + ' does not have access to resource Game: ' + gameId);
      }

      if (errorResponse.hasErrors()) {
        res.writeHead(401, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse());
        res.end();
        return;
      }

      const code = utils.roomCode();

      const room = await Room.create({
        code
      });

      await game.addRoom(room);
      await room.setGame(game);

      wsController.createRoomServer(room.id);

      return {...room.dataValues}
    });
}