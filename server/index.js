const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hint: {
    type: DataTypes.STRING,
    allowNull: true
  },
  index: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id'
    }
  }
});

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  index: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correct: {
    type: DataTypes.BOOLEAN
  },
  question_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Question,
      key: 'id'
    }
  }
});

Question.hasMany(Answer);
Answer.belongsTo(Question);
Question.belongsTo(Room);
Room.hasMany(Question);

const UserSessions = sequelize.define('UserSessions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: 'id'
    }
  }
});

User.belongsToMany(Room, { through: 'UserSessions' });
Room.belongsToMany(User, { through: 'UserSessions' });

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

authenticate().then(create).then(main);

const express = require('express');
const bodyParser = require('body-parser');

async function main() {
  console.log('In main now...');
  const mark = User.build({name: 'CapnDuck'});
  await mark.save();
  const kristen = User.build({name: 'Kristen'});
  await kristen.save();

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
    console.log('Received POST request to /rooms');
    console.log('Body:');
    console.log(req.body);
    const room = Room.build({ name: req.body.name });
    await room.save();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({...room.dataValues}));
    res.end();
  });

  app.listen(port, () => {
    console.log('Trivia Server app is now listening');
  });
}
