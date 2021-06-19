import { useEffect } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"
import { useAppDispatch } from "../store";
import { fetchGameDetails, fetchGames, selectAllGames, selectGameDetails } from "../store/gamesSlice";
import EditGame from '../components/EditGame';
import { selectToken, selectUsername } from "../store/userSlice";

export default function GamePage() {
    const { id } = useParams<{id: string}>();
    const dispatch = useAppDispatch();
    const games = useSelector(selectAllGames);
    const gameDetails = useSelector(selectGameDetails(parseInt(id)));
    const token = useSelector(selectToken);
    const username = useSelector(selectUsername);

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
        const ws = new WebSocket(`${protocol}://${username}:${token}@${window.location.host}/ws/ABCDE`);

        ws.onopen = function open() {
            ws.send("I'm the owner of the room");
        };

        ws.onmessage = function message(msg) {
            console.log('Received message');
            console.log(msg);
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
                <button onClick={startGame}>Start Game</button>
            }
            {
                gameDetails &&
                <EditGame game={gameDetails} />
            }


        </div>
    )
}
