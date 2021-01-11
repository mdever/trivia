import * as React from 'react';

import NewGame from './NewGame';
import GamesList from './GamesList';
import { useState } from 'react';
import { useHistory } from 'react-router';

function JoinRoom() {
    let history = useHistory();
    let [code, setCode] = useState('');

    const joinRoom = () => {
        history.push('/rooms/' + code);
    }

    return (
        <div className="full-width">
            <h3>Join Game</h3>
            <label htmlFor="code">Code:</label>
            <input type="text" name="code" onChange={ev => setCode(ev.target.value)}/>
            <button className="btn btn-primary" onClick={joinRoom}>Join</button>
        </div>
    );
}

export default function HomePage(props) {
    return (
        <div id="home-page">
            <div className="row justify-content-center" style={{minHeight: '300px', paddingTop: '3rem'}}>
                <div className="col-md-4">
                    <JoinRoom />
                </div>
            </div>
            <div className="row" style={{minHeight: '300px'}}>
                <div className="col-md-6 justify-text">
                    <h3>My Games</h3>
                    <GamesList />
                </div>
                <div className="col-md-6">
                    <h3>New Game</h3>
                    <NewGame />
                </div>
            </div>
        </div>
    );
}