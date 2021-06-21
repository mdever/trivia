import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { GameState } from '../gamesession';
import OwnerRoom from './OwnerRoom';
import PlayerRoom from './PlayerRoom';

export default function GameRoom() {
    const location = useLocation<{ owner: boolean | null, gameState?: GameState}>()
    const { roomCode } = useParams<{roomCode: string}>();

    const innerRoom = location.state.owner ? <OwnerRoom gameState={location.state.gameState}/> : <PlayerRoom roomCode={roomCode}/>

    return <React.Fragment>{innerRoom}</React.Fragment>

}