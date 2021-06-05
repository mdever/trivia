import * as sqlite3 from 'sqlite3';
const db = new sqlite3.Database('../db/trivia.db');

export default db;