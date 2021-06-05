import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

import { Button, Container, Grid, Input, InputLabel, Paper } from '@material-ui/core';
import styled from 'styled-components';
import { Link } from "react-router-dom";

const StyledPaper = styled(Paper)`
    border-radius: 40px !important;
    min-height: 275px;
    margin-bottom: 2rem;

    form {
        margin-top: 2rem;

        .MuiInputBase-root {
            margin-bottom: 1rem;
        }
    }
`;

export default function UnauthenticatedHomePage() {
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function loginUser() {
        console.log(`Attempting authentication with user ${username} and password ${password}`);
    }

    return (
        <Grid container spacing={3} justify="center">
            <Grid xs={3}>
                <StyledPaper elevation={3}>
                    <Grid container spacing={4} justify="center">
                        <Grid xs={6}>
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