import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUserSelector, isOwnerSelector } from '../redux/selectors';


export default function OwnerRoom(props) {

    let dispatch = useDispatch();
    let ws = props.ws;
    let code = props.code;

    function startGame(code) {
        ws.send(JSON.stringify({ event: 'START_GAME' }))
    }

    return (
        <div>
            <p>Owner Room</p>
            <button onClick={() => startGame(code)}>Start Game</button>
        </div>

    )
}