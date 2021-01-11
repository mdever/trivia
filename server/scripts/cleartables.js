const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../trivia.db');

db.serialize(function () {
    console.log('Preparing to delete all entries from the Rooms table');
    let stmt = db.prepare("DELETE FROM Rooms WHERE id IN (SELECT id FROM Rooms)");
    stmt.run();
    stmt.finalize();
});

db.close();

console.log('All Done');