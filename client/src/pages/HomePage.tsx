import { Grid } from "@material-ui/core";
import GamesList from '../components/GamesList';

export default function HomePage() {
    return (
        <Grid container spacing={6} justify="center">
            <Grid item xs={12} md={5}>
                Join Game
            </Grid>
            <Grid item xs={12} md={5}>
                <GamesList />
            </Grid>

        </Grid>

    );
}