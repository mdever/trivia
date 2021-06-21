import GamesList from '../components/GamesList';
import { Grid, InputLabel, Input, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';

export default function HomePage() {
    const history = useHistory();
    const [roomCode, setRoomCode] = useState('');

    return (
        <Grid container spacing={6} justify="center">
            <Grid item xs={12} md={5}>
                <InputLabel htmlFor="room-code">Join</InputLabel>
                <Input type="text" id="room-code" onChange={(e) => setRoomCode(e.target.value)}/>
                <Button onClick={() => {
                    history.push(`/rooms/${roomCode}`, {owner: false})
                }}>Join</Button>
            </Grid>
            <Grid item xs={12} md={5}>
                <GamesList />
            </Grid>

        </Grid>

    );
}