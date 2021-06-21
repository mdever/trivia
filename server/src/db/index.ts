import * as sqlite3 from 'sqlite3';
import levelup from 'levelup';
import leveldown from 'leveldown';
import { GameState } from '../types';

const db = new sqlite3.Database('../db/trivia.db');

export const roomdb = levelup(leveldown('../db/roomdb.db'));

export async function fetchGameState(code: string): Promise<GameState> {
    return new Promise((resolve, reject) => {
        roomdb.get(code, (err, value) => {
            if (err) {
                console.log(`Error retrieving gamestate code ${code}`);
                reject(err);
            }

            const gameState = JSON.parse(value.toString('utf-8'));
            resolve(gameState);
        })
    });
}

export async function patchGameState(gameState: GameState): Promise<boolean> {
    return new Promise((resolve, reject) => {
        roomdb.put(gameState.roomCode, JSON.stringify(gameState), (err) => {
            if (err) {
                console.log(`Updating gamestate for room code ${gameState.roomCode}`);
                reject(err);
            }

            resolve(true);
        })
    });
}

export async function putGameState(roomCode: string, gameState: GameState): Promise<boolean> {
    return new Promise((resolve, reject) => {
        roomdb.put(roomCode, JSON.stringify(gameState), (err) => {
            if (err) {
                console.log(`Error creating new game state for roomCode ${roomCode}`);
                reject(err);
            }

            resolve(true);
        })
    });
}

export default db;
