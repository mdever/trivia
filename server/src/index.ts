import express, { NextFunction, RequestHandler, response } from 'express';
import { Request, Response } from 'express';
import { emitWarning } from 'process';
import { tokenToString } from 'typescript';
import { createNewGame, getGamesByUserId } from './db/games';
import { authenticate, checkForSessionAndFetchUser, createNewUser, fetchAvatarByUsername, logout, updateAvatarForUser } from './db/users';
import { CreateGameRequest, LoginRequest, NewUserRequest, NewUserResponse } from './types';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import process from 'process';


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

app.post('/users', async (req: Request<{}, {}, NewUserRequest>, res: Response<NewUserResponse>) => {
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

app.post('/sessions', async (req: Request<{}, {}, LoginRequest>, res) => {
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

app.delete('/sessions', authenticateUser, async (req: Request, res: Response) => {
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
    
});

app.post('/users/avatar', authenticateUser, upload.single('avatar'), async (req: Request, res: Response) => {
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

app.get('/users/:username/avatar', authenticateByCookie, async (req: Request, res: Response) => {

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

app.listen(8080, () => {
    console.log('App is listening at http://localhost:8080');
})
