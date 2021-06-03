import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchGames, GameEntity, selectAllGames, selectGamesError, selectGamesLoading } from "../store/gamesSlice";

import styled from 'styled-components';

const StyledHeaderDiv = styled.div`
    background: blue;

    p {
        display: inline-block;
    }
`;

export default function LoginPage() {
    const dispatch = useDispatch();
    const allGames = useSelector(selectAllGames);
    const loading = useSelector(selectGamesLoading);
    const error = useSelector(selectGamesError);


    useEffect(() => {
        dispatch(fetchGames());
    }, []);

    return (
        <StyledHeaderDiv>
            <h1 className="background-blue">Login Page</h1>
            {   
                (error && 
                    <h3>An error occurred fetching games</h3>) ||    
                ((loading && 
                <h3>Loading...</h3>) || 
                allGames && allGames.map((game: GameEntity) => 
                    <p>{game.name}</p>
                ))
            }
        </StyledHeaderDiv>
    );
}