"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const games_1 = require("./db/games");
const users_1 = require("./db/users");
const app = express_1.default();
app.use(express_1.default.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Hello World');
}));
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRequest = req.body;
    try {
        const result = yield users_1.createNewUser(userRequest);
        res.status(200)
            .send({
            status: 'success',
            user: {
                username: userRequest.username,
                token: result.token
            }
        });
    }
    catch (err) {
        res.status(500)
            .send({
            status: 'failure',
            error: {
                code: 1001,
                error: 'Could not create a new user',
                errorMessage: err.error.message
            }
        });
    }
}));
app.post('/sessions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const authenticationResult = yield users_1.authenticate(username, password);
        res.status(200)
            .send({
            token: authenticationResult.token,
            user: {
                username: authenticationResult.user.username
            }
        });
    }
    catch (err) {
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
}));
function authenticateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const user = yield users_1.checkForSessionAndFetchUser(token);
            res.locals.username = user.username;
            res.locals.userid = user.userid;
            next();
        }
        catch (err) {
            res.status(401)
                .send({
                code: 401,
                error: 'Not Authorized',
                errorMessage: 'No session present'
            });
            return;
        }
    });
}
app.post('/games', authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userid } = res.locals;
    const { name } = req.body;
    try {
        const { gameId } = yield games_1.createNewGame(name, userid);
        res.status(200)
            .send({
            name,
            gameId
        });
    }
    catch (err) {
        console.log('Could not create new game');
        console.log(err);
        res.status(500)
            .send({
            code: 500,
            error: 'Database Insertion Failure',
            errorMessage: `Could not insert game ${name} into database`
        });
    }
}));
app.get('/games', authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userid } = res.locals;
    try {
        const games = yield games_1.getGamesByUserId(userid);
        console.log('Back in web layer...Got games');
        console.log(games);
        res.status(200)
            .send({
            games
        });
    }
    catch (err) {
        console.log(err);
        res.status(500)
            .send({
            code: 500,
            error: 'Database Retrieval Failure',
            errorMessage: `Could not get games by user id ${userid}`
        });
    }
}));
app.listen(8080, () => {
    console.log('App is listening at http://localhost:8080');
});
//# sourceMappingURL=index.js.map