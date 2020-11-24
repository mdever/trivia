import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectGame, currentUserSelector } from '../redux/selectors';
import { fetchGames } from '../redux/actions';

export function EditQuestion(props) {

    return (
        <div>
            <p>Edit Question</p>    
        </div>
    )
}

function addQuestion(gameId) {
    return function (question) {
        console.log('Adding question ' + JSON.stringify(question) + ' to game ' + gameId);
    }
}

export default function EditGame(props) {
    let { id } = useParams();
    let game = useSelector(selectGame(id));
    let user = useSelector(currentUserSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!game) {
            dispatch(fetchGames(user.id, {includeQuestions: true}));
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
                    <form>
                        <ul>
                            { 
                                props.game.questions.map(question => 
                                    <li>
                                        <EditQuestion question={question} addQuestion={addQuestion(props.game.id)} />
                                    </li>
                                )
                            }
                        </ul>
                    </form>
                </div>
            }
        </div>
    )
}