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
exports.getGamesByUserId = exports.createNewGame = void 0;
const _1 = __importDefault(require("."));
const createNewGameProcedure = _1.default.prepare('INSERT INTO games (name, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create stored procedure create-new-game');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
});
const getGamesByUserIdProcedure = _1.default.prepare('SELECT * FROM games WHERE ownerId = ?', (err) => {
    if (err) {
        console.log('Could not create stored procedure get-games-by-user-id');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
});
function createNewGame(name, userid) {
    return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (err) {
                console.log('Error inserting game');
                console.log(err);
                reject('Could not insert game');
                return;
            }
        });
    });
}
exports.createNewGame = createNewGame;
function getGamesByUserId(userid) {
    return __awaiter(this, void 0, void 0, function* () {
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
                    }, 3000);
                });
            }
            catch (err) {
                console.log('Error retrieving games');
                console.log(err);
                reject('Could not retrieve games');
                return;
            }
        });
    });
}
exports.getGamesByUserId = getGamesByUserId;
//# sourceMappingURL=games.js.map