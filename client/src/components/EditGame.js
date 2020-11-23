import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectGame } from '../redux/selectors';
import { fetchGames } from '../redux/actions';


export default function EditGame(props) {
    let { id } = useParams();
    let game = useSelector(selectGame(id));
    const dispatch = useDispatch();

    useEffect(() => {
        if (!game) {
            dispatch(fetchGames());
        }
    }, [id]);

    return (
        <div>
            { !game &&
                <div>
                    Could not find game with ID {id}
                </div>
            }
            { game &&
                <div>
                    Edit Game {game.name}
                </div>
            }
        </div>
    )
}