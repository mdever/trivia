import express, { NextFunction, RequestHandler, response } from 'express';
import { Request, Response } from 'express';
import { emitWarning } from 'process';
import { tokenToString } from 'typescript';
import { createNewGame, getGamesByUserId } from './db/games';
import { authenticate, checkForSessionAndFetchUser, createNewUser } from './db/users';
import { CreateGameRequest, LoginRequest, NewUserRequest, NewUserResponse } from './types';

const app = express();
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    res.send('Hello World');
});

app.post('/users', async (req: Request<{}, {}, NewUserRequest>, res: Response<NewUserResponse>) => {
    const userRequest: NewUserRequest = req.body;
    try {
        const result = await createNewUser(userRequest);
        res.status(200)
            .send({
                status: 'success',
                user: {
                    username: userRequest.username,
                    token: result.token
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

app.post('/sessions', async (req: Request<{}, {}, LoginRequest>, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const authenticationResult = await authenticate(username, password);
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

app.post('/games', authenticateUser, async (req: Request<{}, {}, CreateGameRequest>, res: Response) => {
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

app.get('/games', authenticateUser, async (req: Request, res: Response) => {
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
    
})

app.listen(8080, () => {
    console.log('App is listening at http://localhost:8080');
})