import { Button, Grid, Input, InputLabel, Paper, styled } from "@material-ui/core";
import { Alert } from '@material-ui/lab'
import { unwrapResult } from "@reduxjs/toolkit";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useAppDispatch } from "../store";
import { registerNewUser, selectUserError, selectUserLoading } from "../store/userSlice";

const StyledPaper = styled(Paper)({
    minHeight: '275px',
    borderRadius: '40px',
    marginBottom: '1rem'
});

const StyledInput = styled(Input)({
    marginBottom: '1rem'
});


export default function RegisterPage() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    // const userError = useSelector(selectUserError);
    // const userLoading = useSelector(selectUserLoading);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConf, setPasswordConf] = useState('');
    const [validationError, setValidationError] = useState<null | string>(null);

    function validateAndAttemptCreation() {
        if (password !== passwordConf) {
            setValidationError('Password must match Password Confirmation');
            return;
        }

        setValidationError(null);

        dispatch(registerNewUser({username, password}))
            .then(unwrapResult)
            .then(result => {
                if (result.user.username === username) {
                    history.push('/');
                }
            })
    }


    return (
        <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
                <StyledPaper elevation={3}>
                    <Grid container justify="center">
                        <Grid item xs={6}>
                            <h3>Sign Up</h3>
                            <form style={{marginTop: '2rem', marginBottom: '2rem'}}>
                                <InputLabel htmlFor="username">Username</InputLabel>
                                <StyledInput name="username" type="text" onChange={(e) => setUsername(e.target.value) }/>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <StyledInput name="password" type="password" onChange={(e) => setPassword(e.target.value) }/>
                                <InputLabel htmlFor="password_confirmation">Password Confirmation</InputLabel>
                                <StyledInput name="password_confirmation" type="password" onChange={(e) => setPasswordConf(e.target.value) }/>
                                <Button variant="contained" color="primary" type="button" onClick={validateAndAttemptCreation}>Create</Button>
                                {
                                    validationError &&
                                    <Alert severity="error">{validationError}</Alert>
                                }
                            </form>
                        </Grid>
                    </Grid>
                </StyledPaper>
                <aside>Or <Link to="/">Login</Link></aside>
            </Grid>
        </Grid>    
    );
}