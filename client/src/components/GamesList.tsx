import { Button, Input, InputLabel } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewGame, fetchGames, selectAllGames } from "../store/gamesSlice";

export default function GamesList() {
    const dispatch = useDispatch()
    const games = useSelector(selectAllGames);
    const [newGameName, setNewGameName] = useState('');
    
    useEffect(() => {
        dispatch(fetchGames());
    }, []);

    function createGame() {
        dispatch(createNewGame(newGameName))
    }

    function refreshList() {
        dispatch(fetchGames());
    }

    return (
        <div>
            <h3>Create New Game</h3>
            <InputLabel htmlFor="name"></InputLabel>
            <Input name="name" type="text" onChange={(e) => setNewGameName(e.target.value)}/>
            <Button onClick={createGame} variant="contained" color="primary">Create</Button>
            {
                games.map((game, i) => 
                    <div key={i}>
                        {game.name}
                    </div>)
            }
            <Button onClick={refreshList} variant="contained" color="secondary">Refresh</Button>
        </div>
    )
}