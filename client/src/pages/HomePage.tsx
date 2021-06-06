import { Grid } from "@material-ui/core";
import GamesList from '../components/GamesList';

export default function HomePage() {
    return (
        <Grid container spacing={3} justify="center">
            <Grid item xs={4}>
                <GamesList />
            </Grid>
        </Grid>

    );
}