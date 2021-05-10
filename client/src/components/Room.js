import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUserSelector, isOwnerSelector, selectCurrentGameName } from '../redux/selectors';
import OwnerRoom from './OwnerRoom';
import PlayerRoom from './PlayerRoom';


export default function Room(props) {

    let { code } = useParams();
    let currentUser = useSelector(currentUserSelector);
    let isOwner = useSelector(isOwnerSelector);
    const [ ws, setWs] = useState(null);
    const [ allPlayers, setAllPlayers ] = useState([]);
    const [ gameInSession, setGameInSession ] = useState(false);
    const [ gameName, setGameName ] = useState(null);

    function startGame() {
        ws.send(JSON.stringify({event: 'START_GAME'}));
        setGameInSession(true);
    }

    useEffect(() => {
        if (ws == null) {
            setWs(new WebSocket('ws://45.55.33.7/' + code + '?user=' + currentUser.username));
            return;
        }
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
                    break;
                }
                case 'GAME_STARTED': {
                    setGameInSession(true);
                    break;
                }
                case 'GAME_NAME': {
                    setGameName(data.payload.name);
                    break;
                }
            }
        }
    }, [code, ws]);

    let roomType = isOwner ? <OwnerRoom ws={ws} code={code} /> : <PlayerRoom ws={ws} code={code} />

    return (
        <div>
            <div>
                <h1>{gameName}</h1>
            </div>
            
            { ws &&
                roomType
            }

            <div>
            { 
            allPlayers.map(player =>
                <p>{player}</p>
                )
            }
            </div>

            
        </div>
    );
}