import * as React from 'react';

import NewGame from './NewGame';
import GamesList from './GamesList';

function JoinRoom() {
    return (
        <div className="full-width">
            <h3>Join Game</h3>
            <label htmlFor="code">Code:</label>
            <input type="text" name="code"/>
            <button className="btn btn-primary">Join</button>
        </div>
    );
}

export default function HomePage(props) {
    const user = props.user;

    return (
        <div id="home-page">
            <div className="row justify-content-center" style={{minHeight: '300px'}}>
                <div className="col-md-4" style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                    <JoinRoom />
                </div>
            </div>
            <div className="row" style={{minHeight: '400px'}}>
                <div className="col-md-6">
                    <GamesList />
                </div>
                <div className="col-md-6">
                    <NewGame />
                </div>
            </div>
        </div>
    );
}