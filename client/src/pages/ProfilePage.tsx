import { Grid, Paper, styled } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { isAuthenticated, selectToken, selectUsername } from "../store/userSlice";
import { Button, Input } from '@material-ui/core';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";

const StyledPaper = styled(Paper)({
    borderRadius: '40px',
    minHeight: '300px',
    marginTop: '-2rem',
})

export default function ProfilePage() {
    const authenticated = useSelector(isAuthenticated);
    const username = useSelector(selectUsername);
    const history = useHistory();
    const [file, setFile] = useState<File|null>();
    const [reloadCount, triggerReload] = useState(0);
    const token = useSelector(selectToken);

    if (!authenticated) {
        history.push('/');
    }

    function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    }

    function uploadFile() {
        if (!file || !token) {
            return;
        }
        const data = new FormData();
        data.append('avatar', file);

        axios.post('/users/avatar', data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            triggerReload(reloadCount + 1);
        })
          .catch(err => console.log(err));
    }

    return (
        <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
                <StyledPaper elevation={3}>
                    <Grid container justify="center">
                        <Grid item xs={8} style={{minHeight: '275px', textAlign: 'center'}}>
                            {
                                username &&
                                <h4>{username}'s Profile</h4>
                            }
                            {
                                username &&
                                <div>
                                    <h5>Avatar</h5>
                                    <img src={`/users/${username}/avatar?v=${reloadCount}`} style={{height: '80px'}}></img>
                                </div>
                            }
                            <Input value="" type="file" style={{marginTop: '1rem', marginBottom: '1rem'}} onChange={handleFileSelect}/>
                            <Button onClick={uploadFile} style={{marginBottom: '1rem'}} variant="contained" color="primary">Upload</Button>
                        </Grid>
                    </Grid>
                </StyledPaper>
            </Grid>
        </Grid>
    )

}