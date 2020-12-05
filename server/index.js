
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');
const { WSController } = require('./ws-controller');

const wsController = WSController.getInstance();

console.log('Attempting to connect to database with properties:');
console.log(config);

const sequelize = new Sequelize('main', config.SQLITE_USER, config.SQLITE_PASSWORD, {
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'trivia.db'),
  logging: true
});
const models = require('./models')(sequelize);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

const port = 8080;

const webRoutes = require('./web')(app);

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

let server;
async function main() {
  const server = app.listen(port, () => {
    console.log('Trivia Server app is now listening');
  });

  wsController.set(server);
}


/* Main Entry Point */
authenticate().then(create).then(main);