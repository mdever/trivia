import db from '.';

const createNewGameProcedure = db.prepare('INSERT INTO games (name, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create stored procedure create-new-game');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
});

const getGamesByUserIdProcedure = db.prepare('SELECT * FROM games WHERE ownerId = ?', (err) => {
    if (err) {
        console.log('Could not create stored procedure get-games-by-user-id');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
})

export async function createNewGame(name, userid): Promise<{ name: string, gameId: number }> {
    return new Promise((resolve, reject) => {
        const createdAt = (new Date()).toISOString();

        try {
            createNewGameProcedure.run(name, userid, createdAt, createdAt, function (err) {
                if (err) {
                    console.log('Error inserting game');
                    console.log(err);
                    reject('Could not insert game');
                    return;
                }

                resolve({
                    name,
                    gameId: this.lastID
                });
            });
        } catch (err) {
            console.log('Error inserting game');
            console.log(err);
            reject('Could not insert game');
            return;
        }
    });
}

export async function getGamesByUserId(userid: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
        try {
            getGamesByUserIdProcedure.all(userid, (err, rows) => {
                if (err) {
                    console.log('Error retrieving games');
                    console.log(err);
                    reject('Could not retrieve games');
                    return;
                }
                setTimeout(() => {
                    resolve(rows);
                }, 3000)

            })
        } catch (err) {
            console.log('Error retrieving games');
            console.log(err);
            reject('Could not retrieve games');
            return;
        }
    })
}
