"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkForSessionAndFetchUser = exports.authenticate = exports.createNewUser = exports.selectUserIdFromSession = void 0;
const _1 = __importDefault(require("."));
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcrypt"));
const getUserByUsername = _1.default.prepare('SELECT * FROM Users WHERE username = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement get-user-by-username');
        throw err;
    }
});
const getUserById = _1.default.prepare('SELECT * FROM Users WHERE id = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement get-user-by-id');
        throw err;
    }
});
const insertUser = _1.default.prepare('INSERT INTO Users (username, salt, pwHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create prepared statement insert-user');
        throw err;
    }
});
const insertSession = _1.default.prepare('INSERT INTO AuthTokens (value, loggedInAt, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create prepared statement insert-session');
        throw err;
    }
});
exports.selectUserIdFromSession = _1.default.prepare('SELECT userId FROM AuthTokens WHERE value = ?', (err) => {
    if (err) {
        console.log('Could not create prepared statement select-user-id-from-session');
        throw err;
    }
});
function createNewUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const salt = yield bcrypt.genSalt(10);
            const pwHash = yield bcrypt.hash(user.password, salt);
            const createdAt = (new Date()).toISOString();
            insertUser.run(user.username, salt, pwHash, createdAt, createdAt);
            const { sessionid } = yield authenticate(user.username, user.password);
            return {
                username: user.username,
                token: sessionid
            };
        }
        catch (err) {
            console.log(`Could not create new user: ${user.username}`);
            throw err;
        }
        return {
            status: 'success',
            user: {
                username: user.username
            }
        };
    });
}
exports.createNewUser = createNewUser;
function authenticate(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const sessionid = crypto.randomBytes(128).toString('hex');
            getUserByUsername.get(username, (err, row) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    console.log(`Could not retrieve user: ${username}`);
                    reject(err);
                    return;
                }
                const comparison = yield bcrypt.compare(password, row.pwHash);
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
            }));
        });
    });
}
exports.authenticate = authenticate;
function checkForSessionAndFetchUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            exports.selectUserIdFromSession.get(token, (err, row) => {
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
                });
            });
        });
    });
}
exports.checkForSessionAndFetchUser = checkForSessionAndFetchUser;
//# sourceMappingURL=users.js.map