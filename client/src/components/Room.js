import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUserSelector, isOwnerSelector } from '../redux/selectors';


export default function Room(props) {

    let { code } = useParams();
    let currentUser = useSelector(currentUserSelector);
    let isOwner = useSelector(isOwnerSelector);
    let ws;
    const [ allPlayers, setAllPlayers ] = useState([]);

    function startGame() {
        ws.send(JSON.stringify({event: 'START_GAME'}))
    }

    useEffect(() => {
        ws = new WebSocket('ws://localhost:8080/' + code + '?user=' + currentUser.username);
        ws.onopen = function () {
            console.log('Connected');
        }
        ws.onmessage = function (msg) {
            console.log('Received message: ' + msg.data);
            const data = JSON.parse(msg.data);
            switch(data.event) {
                case 'PLAYERS_LIST': {
                    setAllPlayers(prevState => ([...prevState, ...data.payload.users]));
                    break;
                }
                case 'NEW_PLAYER': {
                    setAllPlayers(prevState => ([...prevState, data.payload.user]));
                }
            }
        }
    }, [code]);

    return (
        <div>
            <div>In room now</div>
            <div>
            { 
            allPlayers.map(player =>
                <p>{player}</p>
                )
            }
            </div>
            { isOwner &&
                <button onClick={startGame}>Start</button>
            }
            
        </div>
    );
}