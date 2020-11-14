const { Sequelize, DataTypes, Op } = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:');
const { User, Room, UserSessions, Question, Answer } = require('./models')(sequelize);

authenticate().then(create).then(main);

async function authenticate() {
  try {
    console.log('Attempting DB authentication...');
    await sequelize.authenticate();
    console.log('DB authentication successful');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
}

async function create() {
  await sequelize.sync();
}

const express = require('express');
const bodyParser = require('body-parser');

async function main() {
  console.log('In main now...');
  const mark = User.build({name: 'CapnDuck'});
  await mark.save();
  const kristen = User.build({name: 'Kristen'});
  await kristen.save();

  console.log('All users are: ');
  for (let user of await User.findAll()) {
    console.log("\nName: " + user.name + "\nID: " + user.id + "\n\n");
  }

  let room = Room.build({name: 'codeminers'});
  await room.save();

  await room.addUser(mark);
  await room.addUser(kristen);

  room = await Room.findOne({id: room.id});

  const question1 = Question.build({ question: 'How many people are on earth', hint: 'Its a lot', index: 0 });
  const question2 = Question.build({ question: 'Do you feel lucky punk?', hint: 'Well, do ya?', index: 1 });

  await question1.save();
  await question2.save();

  const answer11 = Answer.build({ answer: 'idk like 5?', index: 0 });
  const answer12 = Answer.build({ answer: '7 billion thereabouts', index: 1, correct: true });
  const answer21 = Answer.build({ answer: 'IDK do I???', index: 0, correct: true });
  const answer22 = Answer.build({ answer: 'I guess not now that you mention it', index: 1});

  await answer11.save();
  await answer12.save();
  await answer21.save();
  await answer22.save();

  await question1.addAnswer(answer11);
  await question1.addAnswer(answer12);
  await question2.addAnswer(answer21);
  await question2.addAnswer(answer22);

  await question1.save();
  await question2.save();

  await room.addQuestion(question1);
  await room.addQuestion(question2);

  await room.save();


  const app = express();
  app.use(bodyParser.json());
  const path = require('path');

  app.use(express.static(path.join(__dirname, 'build')));

  const port = 8080;
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.post('/rooms', async (req, res) => {
    const room = Room.build({ name: req.body.name });
    await room.save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({...room.dataValues}));
    res.end();
  });

  app.post('/sessions', async (req, res) => {
    console.log('Received request to join room...');
    console.log('Room ID: ' + req.body.roomId);
    console.log('User ID: ' + req.body.userId);
    let room = await Room.findByPk(req.body.roomId);
    console.log('Found Room: ');
    console.log(JSON.stringify(room.dataValues));
    const user = await User.findByPk(req.body.userId);
    console.log('Found user: ');
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
  })

  app.listen(port, () => {
    console.log('Trivia Server app is now listening');
  });
}
