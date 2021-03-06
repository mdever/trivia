import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../context/WebSocketContext"
import { GameState } from "../gamesession";

export default function PlayerRoom(props: { roomCode: string}) {
    const { getWs, setWs } = useContext(WebSocketContext);
    const [gameState, setGameState] = useState<GameState | null>();

    useEffect(() => {
        if (getWs() === null) {
            let protocol;
            if (process.env.NODE_ENV === 'development') {
                protocol = 'ws';
            } else {
                protocol = 'wss';
            }
            const ws = new WebSocket(`${protocol}://${window.location.host}/ws/${props.roomCode}`);
            ws.onmessage = msg => {
                setGameState(JSON.parse(msg.data).state);
            }
            setWs(ws);

            ws.onerror = (err) => {
                console.log("Something bad happened in PlayerRoom with the websocket");
                console.dir(err);
                ws.close();
                setWs(null);
            }
        }
    }, []);

    return (
        <div>
            <p>I'm the player room</p>
            {
                gameState &&
                <pre>{JSON.stringify(gameState, null, 2)}</pre>
            }
        </div>
    )
}