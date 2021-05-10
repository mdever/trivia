import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUserSelector, isOwnerSelector } from '../redux/selectors';


export default function PlayerRoom(props) {

    let dispatch = useDispatch();
    let ws = props.ws;
    let code = props.code;
    let [ started, setStarted ] = useState(false);

    useEffect(() => {
        ws.onmessage = function(msg) {
            const data = JSON.parse(msg);
            switch (data.event) {
                case 'START_GAME': {
                    setStarted(true);
                    break;
                }
            }
        }
    }, [code]);

    return (
        <div>
            <p>Player Room</p>
            { started &&
                <p>Start!</p>
            }
        </div>
        

    )
}