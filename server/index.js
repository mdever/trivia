
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');
const { User, Room, UserSessions, Question, Answer, Game } = require('./models')(sequelize);


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

const port = 8080;

const webRoutes = require('./web.js')(app);

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
  try {
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to sync to database: ', error);
  }
}

async function main() {
  app.listen(port, () => {
    console.log('Trivia Server app is now listening');
  });
}


/* Main Entry Point */
authenticate().then(create).then(main);
