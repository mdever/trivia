import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

import { Button, Grid, Input, InputLabel, Paper } from '@material-ui/core';
import styled from 'styled-components';
import { Link, useHistory } from "react-router-dom";
import { useAppDispatch } from "../store";
import { authenticateUser } from "../store/userSlice";
import { unwrapResult } from "@reduxjs/toolkit";

const StyledPaper = styled(Paper)`
    border-radius: 40px !important;
    min-height: 275px;
    margin-bottom: 1rem;

    form {
        margin-top: 2rem;

        .MuiInputBase-root {
            margin-bottom: 1rem;
        }
    }
`;

export default function UnauthenticatedHomePage() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function loginUser() {
        dispatch(authenticateUser({username, password}))
            .then(unwrapResult)
            .then(result => {
                history.push('/');
            })
    }

    return (
        <Grid container spacing={3} justify="center">
            <Grid item xs={3}>
                <StyledPaper elevation={3}>
                    <Grid container justify="center">
                        <Grid item xs={6}>
                            <h3>Login</h3>
                            <form>
                                <InputLabel htmlFor="username">Username</InputLabel>
                                <Input type="text" name="username" onChange={(e) => setUsername(e.target.value)}/>
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <Input type="password" name="password" onChange={(e) => setPassword(e.target.value)}/>
                                <Button variant="contained" color="primary" type="button" onClick={loginUser}>Login</Button>
                            </form>
                        </Grid>
                    </Grid>
                </StyledPaper>
                <aside>
                    Or <Link to="/register">Signup</Link>
                </aside>
            </Grid>
        </Grid>
    );
}