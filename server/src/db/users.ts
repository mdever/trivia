import db from '.';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { NewUserRequest, NewUserResponse } from '../types';
import { sqlite3, RunResult } from 'sqlite3';

const getUserByUsername = db.prepare('SELECT * FROM Users WHERE username = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement get-user-by-username');
        throw err;
    }
});

const getUserById = db.prepare('SELECT * FROM Users WHERE id = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement get-user-by-id');
        throw err;
    }
});


const insertUser = db.prepare('INSERT INTO Users (username, salt, pwHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create prepared statement insert-user');
        throw err;
    }
});

const insertSession = db.prepare('INSERT INTO AuthTokens (value, loggedInAt, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create prepared statement insert-session');
        throw err;
    }
})

export const selectUserIdFromSession = db.prepare('SELECT userId FROM AuthTokens WHERE value = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement select-user-id-from-session');
        throw err;
    }
})

export async function createNewUser(user: NewUserRequest) {

    try {
        const salt = await bcrypt.genSalt(10);
        const pwHash = await bcrypt.hash(user.password, salt);
        const createdAt = (new Date()).toISOString();

        insertUser.run(user.username, salt, pwHash, createdAt, createdAt);

        const { token } = await authenticate(user.username, user.password);

        return {
            username: user.username,
            token
        };

    } catch (err) {
        console.log(`Could not create new user: ${user.username}`);
        throw err;
    }



    return {
        status: 'success',
        user: {
            username: user.username
        }
    }
}

export async function authenticate(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const sessionid = crypto.randomBytes(128).toString('hex');
        getUserByUsername.get(username, async (err, row) => {
            if (err) {
                console.log(`Could not retrieve user: ${username}`);
                reject(err);
                return;
            }
            if (!row) {
                console.log(`Could not find user: ${username}`);
                reject(err);
                return;
            }
    
            const comparison = await bcrypt.compare(password, row.pwHash);
            if (!comparison) {
                console.log('Invalid username password combination');
                reject('Invalid username/password combination');
                return;
            }
            const loggedInAt = (new Date()).toISOString();
    
            insertSession.run(sessionid, loggedInAt, row.id, loggedInAt, loggedInAt);
    
            resolve({
                token: sessionid,
                user: {
                    username: row.username
                }
            });
        });
    });
}

export function checkForSessionAndFetchUser(token: string): Promise<{userid: string, username: string}> {
    return new Promise((resolve, reject) => {
        selectUserIdFromSession.get(token, (err, row) => {
            if (err) {
                console.log('Error finding session for session id');
                console.log(err.message);
                console.log(err.stack);
                reject('No Session found');
                return;
            }

            if (!row) {
                console.log('Error finding session for session id');
                reject('No Session found');
                return;
            }
            const { userId } = row;
            getUserById.get(userId, (err, row) => {
                if (err) {
                    console.log(`Error finding user for user id ${userId}`);
                    console.log(err.message);
                    console.log(err.stack);
                    reject('No user found for session');
                    return;
                }

                resolve({
                    userid: row.id,
                    username: row.username
                });
            })
        })
    });
}

export function logout(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM AuthTokens WHERE value = ?', token, function (err) {
            if (err) {
                console.log(`Could not delete user session ${token}`);
                reject(err);
                return;
            }

            console.log(`Removed user session ${token}, rowId: ${this.lastID}`);
            resolve(true);
        });
    });
}