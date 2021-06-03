import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGames, GameEntity, selectAllGames, selectGamesLoading } from "../store/gamesSlice";


export default function LoginPage() {
    const dispatch = useDispatch();
    const allGames = useSelector(selectAllGames);
    const loading = useSelector(selectGamesLoading);


    useEffect(() => {
        dispatch(fetchGames());
    }, []);

    return (
        <div>
            <h1>Login Page</h1>
            {   (loading && 
                <h3>Loading...</h3>) || 
                allGames && allGames.map((game: GameEntity) => 
                    <p>{game.name}</p>
                )
            }
        </div>
    );
}