import { useSelector } from 'react-redux';

function GameItem(props) {
    return (
        <div>
            <p>{props.game.name}</p>
        </div>
    )
}

export default function GamesList() {
    const games = useSelector(state => state.games.games);

    return (
        <div>
            <ul>
            {   games.map(game => {
                    return <li>
                        <GameItem game={game} />
                    </li>
                })
            }  
            </ul>
        </div>
    );
}