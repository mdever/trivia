import { useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loggedInSelector } from '../redux/selectors';

const headerStyle = {
    paddingTop: '2rem',
    paddingBottom: '1rem'
}

export default function Header(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const isLoggedIn = useSelector(loggedInSelector);
    let match = useRouteMatch('/');

    return (
        <header style={headerStyle}>
            <div className="row">
                { !match.isExact &&
                <div className="col-md-4">
                    <Link to="/">Home</Link>
                </div>
                }

                <div className={ match.isExact ? 'col-md-4 offset-md-4' : 'col-md-4' }>
                    <h1>Trivia</h1>
                </div>
                { isLoggedIn &&
                <div className="col-md-4">
                    <button className="btn btn-danger" onClick={props.logout}>Logout</button>
                </div>
                }
                { !isLoggedIn &&
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="loginUsername" name="username">Username</label>
                        <input type="text" onChange={event => setUsername(event.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="loginPassword" name="password">Password</label>
                        <input type="text" onChange={event => setPassword(event.target.value)} />
                    </div>
                    <div className="form-group">
                        <input className="btn btn-primary" type="submit" value="Login" onClick={ () => props.login({username, password}) } />
                    </div>
                </div>
                }
            </div>
        </header>
    );
  }