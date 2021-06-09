import { Button, Input, InputLabel, Paper, Grid, List, ListItem, ListItemText } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
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
        <Grid container spacing={2}>
            <Grid container item xs={12}>
                <Grid item xs={12} md={6}>
                    <h3 style={{textAlign: 'center', margin: 0}}>Create New Game</h3>
                </Grid>
                <Grid item style={{textAlign: 'center'}} xs={12} md={6}>
                    <Button style={{margin: 0, padding: 0, height: '40px', width: '100px'}} onClick={refreshList} variant="outlined" color="primary">Refresh</Button>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Paper style={{minHeight: '250px', borderRadius: '40px'}} elevation={3}>
                    <List>
                    {
                    games.map((game, i) =>
                        <Link to={`/games/${game.id}`} key={i}>
                            <ListItem>
                                <ListItemText primary={game.name} />
                            </ListItem>
                        </Link>)
                    }
                    </List>

                </Paper>
            </Grid>
            <Grid container item xs={12}>
                <Grid item xs={6}>
                    <InputLabel htmlFor="name">Name</InputLabel>
                    <Input name="name" type="text" onChange={(e) => setNewGameName(e.target.value)}/>
                </Grid>
                <Grid container alignItems="center" direction="row-reverse" item xs={6}>
                    <Grid item xs={6}>
                        <Button style={{margin: 'auto'}} onClick={createGame} variant="contained" color="primary">Create</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}