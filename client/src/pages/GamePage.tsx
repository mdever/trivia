import { useEffect } from "react"
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom"
import { useAppDispatch } from "../store";
import { fetchGameDetails, fetchGames, selectAllGames, selectGameDetails } from "../store/gamesSlice";
import EditGame from '../components/EditGame';
import { selectToken, selectUsername } from "../store/userSlice";
import { Grid, Button } from '@material-ui/core';


export default function GamePage() {
    const { id } = useParams<{id: string}>();
    const dispatch = useAppDispatch();
    const games = useSelector(selectAllGames);
    const gameDetails = useSelector(selectGameDetails(parseInt(id)));
    const history = useHistory();

    useEffect(() => {
        let gameid = parseInt(id);
        if (games.length === 0) {
            dispatch(fetchGames());
        }
        dispatch(fetchGameDetails(gameid));
    }, [id])

    function startGame() {
        let protocol;
        if (process.env.NODE_ENV === 'development') {
            protocol = 'ws';
        } else {
            protocol = 'wss';
        }
        const ws = new WebSocket(`${protocol}://${window.location.host}/ws/start/${id}`);

        ws.onmessage = function message({data}) {
            console.log('Received message');
            console.log(data);
            const message = JSON.parse(data);
            if (message.event !== 'SET_CODE') {
                console.log('Something went wrong, got an unexpected response from server');
                ws.close();
                return;
            }
            ws.onmessage = null;
            history.push(`/rooms/${message.payload}`, {owner: true, ws});
        };
    }

    return (
        <div>
            {
                gameDetails && 
                <h1>{gameDetails.name}</h1>
            }
            {
                gameDetails &&
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Button color="primary" variant="contained" onClick={startGame}>Start Game</Button>
                    </Grid>
                </Grid>
            }
            {
                gameDetails &&
                <EditGame game={gameDetails} />
            }


        </div>
    )
}
