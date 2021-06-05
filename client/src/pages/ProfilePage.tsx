import { Grid, Paper } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { isAuthenticated } from "../store/userSlice";

export default function ProfilePage() {
    const authenticated = useSelector(isAuthenticated);
    const history = useHistory();

    if (!authenticated) {
        history.push('/');
    }

    return (
        <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
                <Paper elevation={3}>
                    Profile component here
                </Paper>
            </Grid>
        </Grid>
    )

}