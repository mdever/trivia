import { useContext, useEffect, useState } from "react"
import { WebSocketContext } from "../context/WebSocketContext";
import { GameState } from "../gamesession";

export default function OwnerRoom(props: {gameState?: GameState}) {
    const { getWs, setWs } = useContext(WebSocketContext);
    const [gameState, setGameState] = useState<GameState |null>();
    const ws = getWs();

    useEffect(() => {
        if (ws === null) {
            return;
        }

        setGameState(props.gameState);

        ws.onmessage = message => {
            console.log('Received new message');
            console.dir(message);
            setGameState(JSON.parse(message.data.payload));
        };
    }, [ws]);

    return (
        <div>
            <p>I'm the owner room</p>
            {
                gameState &&
                <pre>
                    {JSON.stringify(gameState)}
                </pre>
            }
        </div>
    )
}