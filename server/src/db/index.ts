import * as sqlite3 from 'sqlite3';
import levelup from 'levelup';
import leveldown from 'leveldown';

const db = new sqlite3.Database('../db/trivia.db');

export const roomdb = levelup(leveldown('../db/roomdb.db'));

export default db;
