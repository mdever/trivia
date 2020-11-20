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
    const game = Game.build({
      name: req.body.name
    })
    const user = await User.findByPk(req.body.user_id);
    game.setUser(user);

    await game.save();
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