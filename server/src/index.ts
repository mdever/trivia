import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { checkOwnershipOfGame, createNewGame, deleteAnswer, fetchGameForAnswerId, getGamesByUserId, getQuestionsForGame, insertNewAnswer, insertNewQuestion, updateAnswer, validateOwnershipOfGame } from './db/games';
import { authenticate, checkForSessionAndFetchUser, createNewUser, fetchAvatarByUsername, logout, updateAvatarForUser } from './db/users';
import { CreateAnswerRequest, CreateGameRequest, CreateQuestionRequest, GameSessionInfo, GameState, LoginRequest, NewUserRequest, NewUserResponse } from './types';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import process from 'process';
import fs from 'fs';
import https from 'https';
import ws from 'ws';
import url from 'url';
import { createNewGameState, processOwnerMessage, processPlayerMessage } from './game';
import { fetchGameState, patchGameState } from './db';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 16 * 1024 * 1024
    }
});

const app = express();
if (process.env.NODE_ENV) {
    app.use(express.static('public'));
} else {
    app.use(express.static('src/public'));
}

app.use(cookieParser());
app.use(express.json());

function parseCookie(cookieStr: string, key: string): string | null {
    return cookieStr.split(';')?.map(kv => kv.split('=').map(s => s.trim()))?.find(kv => kv[0] === key)[1];
}

app.post('/api/users', async (req: Request<{}, {}, NewUserRequest>, res: Response<NewUserResponse>) => {
    const userRequest: NewUserRequest = req.body;
    try {
        const result = await createNewUser(userRequest);
        res.cookie('session', result.token);
        res.status(200)
            .send({
                status: 'success',
                token: result.token,
                user: {
                    username: userRequest.username
                }
            });
    } catch (err) {
        res.status(500)
            .send({
                status: 'failure',
                error:  {
                    code: 1001,
                    error: 'Could not create a new user',
                    errorMessage: err.error.message
                }
            })
    }
});

app.post('/api/sessions', async (req: Request<{}, {}, LoginRequest>, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const authenticationResult = await authenticate(username, password);
        res.cookie('session', authenticationResult.token);
        res.status(200)
            .send({
                token: authenticationResult.token,
                user: {
                    username: authenticationResult.user.username
                }
            });
    } catch (err) {
        console.log('Invalid username or password');
        res.status(401);
        res.send({
            status: 'failure',
            error: {
                code: 1002,
                error: 'Authentication Failure',
                errorMessage: 'Invalid username or password'
            }
        });
    }
});

async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    if (!req.header('Authorization')) {
        res.status(401)
            .send({
                code: 401,
                error: 'Not Authorized',
                errorMessage: 'No Bearer Token Present'
            });
        return;
    }

    const authHeader = req.header('Authorization');
    if (authHeader.slice(0, 7) !== 'Bearer ') {
        res.status(401)
        .send({
            code: 401,
            error: 'Not Authorized',
            errorMessage: 'Invalid Authorization header present. Expected Bearer token'
        });
        return;
    }

    const token = authHeader.slice(7);
    try {
        const user = await checkForSessionAndFetchUser(token);
        res.locals.username = user.username;
        res.locals.userid = user.userid;
        next();
    } catch (err) {
        res.status(401)
            .send({
                code: 401,
                error: 'Not Authorized',
                errorMessage: 'No session present'
            });
        return;
    }
}

async function authenticateByCookie(req: Request, res: Response, next: NextFunction) {
    console.log(req.cookies);
    if (!req.cookies || !req.cookies['session']) {
        res.status(401)
            .send({
                code: 401,
                error: 'Not Authorized',
                errorMessage: 'No Session Cookie Present'
            });
        return;
    }

    const token = req.cookies['session'];
    try {
        const user = await checkForSessionAndFetchUser(token);
        res.locals.username = user.username;
        res.locals.userid = user.userid;
        next();
    } catch (err) {
        res.status(401)
            .send({
                code: 401,
                error: 'Not Authorized',
                errorMessage: 'No session present'
            });
        return;
    }
}

app.delete('/api/sessions', authenticateUser, async (req: Request, res: Response) => {
    const { username, userid } = res.locals;

    const token = req.header('Authorization').slice(7);
    try {
        logout(token);
        res.status(204).send();
        return;
    } catch (err) {
        console.log(`Web Layer: Could not log out user ${username}`);
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Deletion Error',
                errorMessage: 'Could not log out user'
            });
    }
});


app.post('/api/games', authenticateUser, async (req: Request<{}, {}, CreateGameRequest>, res: Response) => {
    const { username, userid } = res.locals
    const { name } = req.body;

    try {
        const { gameId } = await createNewGame(name, userid);
        res.status(200)
            .send({
                name,
                gameId
            });
    } catch (err) {
        console.log('Could not create new game');
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Database Insertion Failure',
                errorMessage: `Could not insert game ${name} into database`
            });
    }
});

app.get('/api/games', authenticateUser, async (req: Request, res: Response) => {
    const { username, userid } = res.locals

    try {
        const games = await getGamesByUserId(userid);
        console.log('Back in web layer...Got games');
        console.log(games);
        res.status(200)
            .send({
                games
            });
    } catch (err) {
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Database Retrieval Failure',
                errorMessage: `Could not get games by user id ${userid}`
            });
    }    
});

app.post('/api/games/:gameid/questions', authenticateUser, async (req: Request<{gameid: string}, {}, CreateQuestionRequest>, res: Response) => {
    const { username, userid } = res.locals;
    if (!parseInt(req.params.gameid)) {
        res.status(400)
            .send({
                code: 400,
                error: 'Client Error',
                errorMessage: 'Client Error: Second Path Param should be an integer'
            })
        return;
    }

    const gameid = parseInt(req.params.gameid);
    try {
        const authorized = await validateOwnershipOfGame(gameid, userid);
        if (!authorized) {
            res.status(401).send();
            return;
        }

        const questions = await getQuestionsForGame(gameid);
        const existingIndexes = questions.map(q => q.index);
        if (req.body.index && existingIndexes.includes(req.body.index)) {
            res.status(400)
                .send({
                    code: 400,
                    error: 'Invalid Question',
                    errorMessage: `Question index ${req.body.index} already used`
                });
            return;
        }

        const resultQuestion = await insertNewQuestion(gameid, req.body);
        res.status(200)
            .send(resultQuestion);
        
    } catch (err) {
        res.status(500)
            .send({
                code: 500,
                error: 'Database error',
                errorMessage: 'An error occured posting new question'
            });
        return;
    }
})

app.get('/api/games/:gameid/questions', authenticateUser, async (req: Request<{gameid: string}>, res: Response) => {
    const { username, userid } = res.locals;
    if (!parseInt(req.params.gameid)) {
        res.status(400)
            .send({
                code: 400,
                error: 'Client Error',
                errorMessage: 'Client Error: Second Path Param should be an integer'
            });
        return;
    }
    const gameid = parseInt(req.params.gameid);

    try {
        const authorized = await validateOwnershipOfGame(gameid, userid);
        if (!authorized) {
            res.status(401)
                .send();
            return;
        }
        const questions = await getQuestionsForGame(gameid);
        res.status(200)
            .send(questions);
        return;
    } catch (err) {
        console.log('Error caught from db layer getQuestionsForGame');
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Database Error',
                errorMessage: `Could not retrieve questions for game ${gameid}`
            });
    }


});

app.post('/api/games/:gameid/questions/:questionid/answers', authenticateUser, async (req: Request<{ gameid: string, questionid: string }, {}, CreateAnswerRequest>, res: Response) => {
    const {userid, username} = res.locals;
    const gameid = parseInt(req.params.gameid);
    const questionid = parseInt(req.params.questionid);
    if (gameid === NaN || questionid === NaN) {
        console.log('Expected numeric values for gameid and questionid. Could not post answer');
        res.status(400)
            .send({
                code: 400,
                error: "Invalid path params",
                errorMessage: ":gameid and :questionid should be integers"
            });
        return;
    }

    try {
        const authorized = await checkOwnershipOfGame(userid, gameid);
        if (!authorized) {
            res.status(401)
                .send({
                    code: 401,
                    error: "Not Authorized",
                    errorMessage: `User ${username} is not authorized to access game id ${gameid}`
                });
            return;
        }

        const dbAnswer = await insertNewAnswer(questionid, req.body);
        res.status(201)
            .send(dbAnswer);

        return;
    } catch (err) {
        console.log(`Error at POST /answers`);
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Server Error',
                errorMessage: 'Could not create new answer. Please check server logs for more information'
            });
        return;
    }
});

app.patch('/api/games/:gameid/answers/:answerid', authenticateUser, async (req: Request<{gameid: string, answerid: string}, {}, Partial<CreateAnswerRequest>>, res: Response) => {
    const { username, userid } = res.locals;
    const gameid = parseInt(req.params.gameid);
    const answerid = parseInt(req.params.answerid);
    if (gameid === NaN || answerid === NaN) {
        console.log('Expected numeric values for gameid and answerid. Could not patch answer');
        res.status(400)
            .send({
                code: 400,
                error: "Invalid path params",
                errorMessage: ":gameid and :answerid should be integers"
            });
        return;
    }

    try {
        const authorized = await checkOwnershipOfGame(userid, gameid);
        if (!authorized) {
            res.status(401)
                .send({
                    code: 401,
                    error: "Not Authorized",
                    errorMessage: `User ${username} is not authorized to access game id ${gameid}`
                });
            return;
        }

        const result = await updateAnswer(answerid, req.body);
        res.status(200)
            .send(result);
        return;
    } catch (err) {
        console.log(`Error occurred patching answer`);
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Server Error',
                errorString: 'Something went wrong patching the answer'
            });
    }
})

app.delete(`/api/games/:gameid/answers/:answerid`, authenticateUser, async (req: Request<{gameid: string, answerid: string}>, res: Response) => {
    const { username, userid } = res.locals;
    const gameid = parseInt(req.params.gameid);
    const answerid = parseInt(req.params.answerid);

    if (gameid === NaN || answerid === NaN) {
        console.log('Expected numeric values for gameid and answerid. Could not patch answer');
        res.status(400)
            .send({
                code: 400,
                error: "Invalid path params",
                errorMessage: ":gameid and :answerid should be integers"
            });
        return;
    }

    try {
        const authorized = await checkOwnershipOfGame(userid, gameid);
        if (!authorized) {
            res.status(401)
                .send({
                    code: 401,
                    error: "Not Authorized",
                    errorMessage: `User ${username} is not authorized to access game id ${gameid}`
                });
            return;
        }

        try {
            const gameId = await fetchGameForAnswerId(answerid);
            if (gameid !== gameId) {
                res.status(401)
                    .send({
                        code: 401,
                        error: 'Invalid Reference',
                        errorMessage: `answer ${answerid} does not belong to game ${gameid}`
                    });
                return;
            }

            const result = deleteAnswer(answerid);
            res.status(200).send({
                answerid
            });
        } catch (err) {
            console.log('Something went wrong in DELETE /answers');
            console.log(err);
            res.status(500)
                .send({
                    code: 500,
                    error: 'Server Error',
                    errorMessage: `Could not delete answerid ${answerid}`
                });
            return;
        }

    } catch (err) {
        console.log(`Error occurred deleting answer`);
        console.log(err);
        res.status(500)
            .send({
                code: 500,
                error: 'Server Error',
                errorString: 'Something went wrong deleting the answer'
            });
    }
})

app.post('/api/users/avatar', authenticateUser, upload.single('avatar'), async (req: Request, res: Response) => {
    const { username, userid } = res.locals;
    if (!req['file']) {
        res.status(400)
            .send('A PNG file is required');
        
        return;
    }

    console.log('got file contents');
    console.log(req['file'].mimetype)
    console.log(req['file'].buffer);

    try {
        const result = await updateAvatarForUser(userid, req['file'].buffer, req['file'].mimetype);
        res.status(201)
            .send({
                status: 'success'
            });
    } catch (err) {
        console.log('Received Error from database layer:');
        console.log(err);
        res.status(501)
            .send({
                code: 501,
                error: 'Database save failure',
                errMessage: 'Failed to save image'
            });
            return;
    }
});

app.get('/api/users/:username/avatar', authenticateByCookie, async (req: Request, res: Response) => {

    try {
        console.log(`Got a request to fetch an avatar for ${req.params.username}`)
        const [avatar, mimetype] = await fetchAvatarByUsername(req.params.username);
        console.log('Database returned');
        console.log(mimetype);
        console.log(avatar);
        const img = Buffer.from(avatar);
        res.writeHead(200, {
            'Content-Type': mimetype,
            'Content-Length': img.length
        });
        res.end(img);
    } catch (err) {
        console.log('Received error from database layer');
        console.log(err);
        res.status(404)
            .send({
                code: 404,
                error: 'Database retrieval failure',
                errorMessage: `Could not retrieve avatar for user ${req.params.username}`
            });
    }
});

const rooms: { [code: string]: GameSessionInfo } = {}

let server;
if (process.env.NODE_ENV === 'prod') {
    var options = {
        key: fs.readFileSync('/ssl/privatekey.pem'),
        cert: fs.readFileSync('/ssl/certificate.pem')
    };
    server = https.createServer(options, app);
    server.on('error', (err) => {
        console.log('Server level error occurred: ');
        console.log(err);
        throw err;
    })
    server.listen(8080, () => {
        console.log('App is listening with SSL at port 8080');
    });
} else {
    server = app.listen(8080, () => {
        console.log('App is listening at http://localhost:8080');
    })
}

function genRoomCode(): string {
    const list = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
    var res = "";
    for(var i = 0; i < 6; i++) {
        var rnd = Math.floor(Math.random() * list.length);
        res = res + list.charAt(rnd);
    }
    return res;
}

server.on('upgrade', async (request, socket, head) => {
    let pathname: string = request.url.replace('/ws/', '');
    pathname = pathname.replace('/wss/', '');
    let wssInfo: GameSessionInfo;
    if (pathname.includes('start')) { // Request to start a game
        const match = pathname.match(/start\/(\d+)/);
        const gameid = parseInt(match[1]);
        const creatorSessionId = parseCookie(request.headers.cookie, 'session');
        const { userid: ownerUserId, username: ownerUserName } = await checkForSessionAndFetchUser(creatorSessionId);
        const authorized = await checkOwnershipOfGame(ownerUserId, gameid);
        if (!authorized) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.pipe(socket);
            return;
        }

        const wss = new ws.Server({noServer: true});

        wssInfo = { server: wss, owner: { userid: ownerUserId, username: ownerUserName, websocket: null}, clients: [] };
        const roomCode = genRoomCode();
        rooms[roomCode] = wssInfo;

        const newGameState: GameState = {
            roomCode,
            gameId: gameid,
            ownerId: ownerUserId,
            ownerName: ownerUserName,
            state: 'AWAITING_PLAYERS',
            lastAction: 'PLAYER_JOINED',
            currentQuestion: null,
            previousQuestions: [],
            players: [],
        }

        await createNewGameState(newGameState);

        wss.on('connection', async (websocket, innerRequest) => {
            console.log('New Websocket connection opened on wss');
            console.dir(wss);
            console.log('ws info');
            console.dir(ws);
            const sessionid = parseCookie(innerRequest.headers.cookie, 'session');
            const { userid, username } = await checkForSessionAndFetchUser(sessionid);

            let isOwner = userid === ownerUserId;
            if (isOwner) {
                wssInfo.owner.websocket = websocket;
                websocket.on('message', message => {
                    console.log(`Received new owner message ${message}`);
                    processOwnerMessage(wssInfo, pathname, message.toString('utf-8'));
                });
                websocket.send(JSON.stringify(newGameState));
            } else {
                wssInfo.clients.push({ websocket, userid, username });
                let gameState = await fetchGameState(roomCode);
                gameState.players.push({
                    playerId: userid,
                    username: username,
                    answers: [],
                    score: 0
                });
                await patchGameState(gameState);
                wssInfo.server.clients.forEach(ws => {
                    ws.send(JSON.stringify(gameState));
                });
                websocket.on('message', message => {
                    console.log(`Receieved new player message ${message}`);
                    processPlayerMessage(wssInfo, pathname, userid, message.toString('utf-8'));
                });
            }
        });
    } else {
        wssInfo = rooms[pathname];
    }
    let wss = wssInfo.server;
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
})

