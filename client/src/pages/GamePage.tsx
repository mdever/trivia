import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAppDispatch } from "../store";
import { fetchGameDetails } from "../store/gamesSlice";

export default function GamePage() {
    const { id } = useParams<{id: string}>();
    const dispatch = useAppDispatch();

    useEffect(() => {
        let gameid = parseInt(id);
        dispatch(fetchGameDetails(gameid));
    }, [id])

    return (
        <div>Games page</div>
    )
}