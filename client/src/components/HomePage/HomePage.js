import * as styles from './HomePage.css';
import * as React from 'react';



function JoinRoom() {
    const joinRoomStyles = {
        'position': 'absolute',
        'top': '50%',
        'transform': 'translateY(-50%)'
    };

    return (
        <React.Fragment>
            <div style={joinRoomStyles}>
                <label for="code">Code:</label>
                <input type="text" name="code"/>
                <input type="submit" value="submit" />
            </div>
        </React.Fragment>
    );
}

export default function HomePage(props) {
    const user = props.user;

    return (
        <div id="home-page" className="container">
            <div class="row justify-content-center" style={{minHeight: '200px'}}>
                <div class="col-md-4">
                    <JoinRoom />
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    First Column
                </div>
                <div class="col-md-4">
                    Second Column
                </div>
                <div class="col-md-4">
                    Third Column
                </div>
            </div>
        </div>
    );
}