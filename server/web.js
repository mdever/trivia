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
    const errorResponse = {
        errors: []
    };

    if (!req.body.name) {
        errorResponse.errors.push({
            type: 'VALIDATION_ERROR',
            title: 'Request body parameters not present',
            invalidParams: [
                {
                    name: 'name',
                    reason: 'not present'
                }
            ]
        })
    }

    if (!req.body.owner_id) {
        if ((validationError = errorResponse.errors.find(error => error.type === 'VALIDATION_ERROR'))) {
            validationError.invalidParams.push({
                name: 'owner_id',
                reason: 'not present'
            })
        } else {
            errorResponse.errors.push({
                type: 'VALIDATION_ERROR',
                title: 'Request body parameters not present',
                invalidParams: [
                    {
                        name: 'owner_id',
                        reason: 'not present'
                    }
                ]
            })
        }
    }

    if (errorResponse.errors.length > 0) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(errorResponse))
        res.end();
        return;
    }

    const user = await User.findByPk(req.body.owner_id);

    if (!user) {
        errorResponse.errors.push({
            type: 'ENTITY_NOT_FOUND',
            title: 'A referenced entity could not be found',
            invalidReferences: [
                {
                    'name': 'owner_id',
                    'value': req.body.user_id,
                    'reason': 'User not found'
                }
            ]
        })

        res.writeHead(400, {'Content-Type': 'application/json'})
        res.write(JSON.stringify(errorResponse));
        res.end();
        return;
    }

    const game = Game.build({
      name: req.body.name
    })


    if (!user) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(
            {
                errors: [{
                    type: 'VALIDATION_ERROR'
                }]
            }))
    }

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