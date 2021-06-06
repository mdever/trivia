import { useSelector } from "react-redux"
import { isAuthenticated } from "../store/userSlice"
import CSS from 'csstype';
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";

const StyledHeader = styled.header`
    max-height: 200px;
    margin-bottom: 2rem;
    background: white;

    h1 {
        margin-left: 2rem;
        display: inline-block;
    }

    ul {
        list-style: none;

        li {
            display: inline-block;
            margin-right: 1em;
        }
    }

    nav {
        float: right;

        * {
            display: inline-block;
        }
    }
`;

export type LogoutFunction = () => void

export default function Header(props: { doLogout: LogoutFunction }) {
    const authenticated = useSelector(isAuthenticated);

    return (
        <StyledHeader>
            <h1>Trivia</h1>
            <nav>
                <ul>
                    <li>
                        First
                    </li>
                    <li>
                        Second
                    </li>
                </ul>
                {
                authenticated &&
                <div>
                    <Link to="/profile">Profile</Link>
                </div>
            }
            {
                authenticated &&
                <div>
                    <Button color="primary" onClick={props.doLogout}>Logout</Button>
                </div>
            }
            </nav>
        </StyledHeader>
    )
}