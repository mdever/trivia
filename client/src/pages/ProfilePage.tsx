import { Grid, Paper, styled } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { isAuthenticated, selectToken } from "../store/userSlice";
import { Button, Input } from '@material-ui/core';
import { ChangeEvent, SyntheticEvent, useState } from "react";
import axios from "axios";

const StyledPaper = styled(Paper)({
    borderWidth: '40px',
    minHeight: '275px',
    marginTop: '-2rem',
})

export default function ProfilePage() {
    const authenticated = useSelector(isAuthenticated);
    const history = useHistory();
    const [file, setFile] = useState<File|null>();
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
        }).then(res => console.log(res))
          .catch(err => console.log(err));
    }

    return (
        <Grid container justify="center" spacing={3}>
            <Grid item xs={4}>
                <StyledPaper elevation={3}>
                    <Grid container justify="center">
                        <Grid item xs={6}>
                            <Input type="file" onChange={handleFileSelect}/>
                            <Button onClick={uploadFile} color="primary">Upload</Button>
                        </Grid>
                    </Grid>
                </StyledPaper>
            </Grid>
        </Grid>
    )

}