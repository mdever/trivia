let { APIError, ErrorSubTypes } = require('./api-errors');

module.exports = function(app, {User, Room, UserSessions, Question, Answer, Game}) {

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.post('/users', async (req, res) => {
    console.log('Received request to create new user: ' + req.body.name);
    const user = User.build({ name: req.body.name });
    await user.save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({...user.dataValues}));
    res.end();
  })

  app.post('/rooms', async (req, res) => {
    const room = Room.build({ name: req.body.name });
    const game = await Game.findOne({ id: req.body.game_id });
    room.setGame(game);
    await room.save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({...room.dataValues}));
    res.end();
  });

  app.post('/games', async (req, res) => {
    const errorResponse = new APIError();

    if (!req.body.name) {
        errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
            name: 'name', reason: 'not present', location: 'BODY'
        }]);
    }

    if (!req.body.owner_id) {
        errorResponse.addValidationError(ErrorSubTypes.VALIDATION_ERROR.PARAMETER_NOT_PRESENT, [{
            name: 'owner_id',
            reason: 'not present',
            location: 'BODY'
        }])
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(errorResponse.getErrorResponse())
        res.end();
        return;
    }

    const user = await User.findByPk(req.body.owner_id);

    if (!user) {
        errorResponse.addInvalidReferenceError(ErrorSubTypes.INVALID_REFERENCE_ERROR.ENTITY_NOT_FOUND, [{
            name: 'owner_id',
            value: req.body.user_id,
            reason: 'User not found'
        }])
    }

    if (errorResponse.hasErrors()) {
        res.writeHead(400, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }

    const game = Game.build({
      name: req.body.name
    })

    game.setUser(user);

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