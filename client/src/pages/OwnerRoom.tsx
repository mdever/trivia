import { Grid } from "@material-ui/core";
import { Fragment, useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import PlayerAvatar from "../components/PlayerAvatar";
import { WebSocketContext } from "../context/WebSocketContext";
import { GameState } from "../gamesession";

export default function OwnerRoom(props: {gameState?: GameState}) {
    const { getWs, setWs } = useContext(WebSocketContext);
    const { roomCode } = useParams<{roomCode: string}>();
    const [gameState, setGameState] = useState<GameState |null>();
    const ws = getWs();

    let division = 12;
    if (gameState) {

    }

    useEffect(() => {
        if (ws === null) {
            return;
        }

        setGameState(props.gameState);

        ws.onmessage = message => {
            console.log('Received new message');
            console.dir(message);
            setGameState(JSON.parse(message.data).state);
        };

        ws.onerror = (err) => {
            console.log('Something bad happened with the websocket');
            console.dir(err);
            ws.close();
            setWs(null);
        }
    }, [ws]);

    return (
        <div>
            <h1>Code </h1>
            {
                gameState &&
                <Fragment>
                    <Grid container spacing={3}>
                        <div></div>
                        {
                            gameState && gameState.players.map(p => 
                                <Grid item xs={1}>
                                    <PlayerAvatar username={p.username} />
                                    <h3>{p.username}</h3>
                                </Grid>
                            )
                        }
                    </Grid>
                    <pre>
                        {JSON.stringify(gameState, null, 2)}
                    </pre>
                </Fragment>

            }
        </div>
    )
}