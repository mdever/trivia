import { useSelector } from "react-redux"
import { isAuthenticated } from "../store/userSlice"
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";

const StyledHeader = styled.header`
    max-height: 200px;
    margin-bottom: 2rem;
    background: rgb(74,68,184);
    background: linear-gradient(90deg, rgba(74,68,184,1) 0%, rgba(101,178,232,0.8575805322128851) 0%, rgba(117,191,238,1) 100%);

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
            {
                authenticated &&
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                        <Button color="primary" onClick={props.doLogout}>Logout</Button>
                    </li>
                </ul>
            }
            </nav>
        </StyledHeader>
    )
}