import { useHistory, useLocation } from 'react-router-dom';
import OwnerRoom from './OwnerRoom';
import PlayerRoom from './PlayerRoom';

export default function GameRoom() {
    const location = useLocation<{ owner: boolean | null, ws: WebSocket}>()

    const innerRoom = location.state.owner ? <OwnerRoom ws={location.state.ws}/> : <PlayerRoom ws={location.state.ws}/>

    return {innerRoom};

}