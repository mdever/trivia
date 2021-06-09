import { useEffect } from "react"
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"
import { useAppDispatch } from "../store";
import { fetchGameDetails, selectGameDetails } from "../store/gamesSlice";
import EditGame from '../components/EditGame';

export default function GamePage() {
    const { id } = useParams<{id: string}>();
    const dispatch = useAppDispatch();
    const gameDetails = useSelector(selectGameDetails(parseInt(id)));

    useEffect(() => {
        let gameid = parseInt(id);
        dispatch(fetchGameDetails(gameid));
    }, [id])

    return (
        <div>
            {
                gameDetails && 
                <h1>{gameDetails.name}</h1>
            }
            {
                gameDetails &&
                <EditGame game={gameDetails} />
            }
            {
                !gameDetails &&
                <h3>Error: No Game found</h3>
            }
        </div>
    )
}
