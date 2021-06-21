import { Server } from "ws";

import { fetchGameState, patchGameState, putGameState } from './db';
import { getGetGameDetails } from "./db/games";
import { GameSessionInfo, GameState } from "./types";

export async function createNewGameState(gameState: GameState) {
    return await putGameState(gameState.roomCode, gameState);
}

export async function processOwnerMessage(serverInfo: GameSessionInfo, code: string, msg: string) {
    const gameState = await fetchGameState(code);
    const gameDetails = await getGetGameDetails(gameState.gameId);
}

export async function processPlayerMessage(serverInfo: GameSessionInfo, code: string, clientId: number, msg: string) {
    const gameState = await fetchGameState(code);
    const gameDetails = await getGetGameDetails(gameState.gameId);
}