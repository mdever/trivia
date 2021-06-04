import { useSelector } from "react-redux"
import { isAuthenticated } from "../store/userSlice"
import CSS from 'csstype';
import styled from "styled-components";

const StyledHeader = styled.header`
    max-height: 200px;
    text-align: center;
    padding-bottom: 2rem;

    ul {
        list-style: none;

        li {
            display: inline-block;
            margin-right: 1em;
        }
    }
`;

export default function Header() {
    const authenticated = useSelector(isAuthenticated);

    return (
        <StyledHeader>
            <h1>Trivia</h1>
            <ul>
                <li>
                    First
                </li>
                <li>
                    Second
                </li>
            </ul>
        </StyledHeader>
    )
}