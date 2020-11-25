import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectGame, currentUserSelector, selectQuestionsForGame } from '../redux/selectors';
import { fetchGames, fetchQuestionsForGame } from '../redux/actions';

export function EditQuestion(props) {

    return (
        <div>
            <p>{props.question.id}</p>
            <p>{props.question.question}</p>
            <p>{props.question.hint}</p>
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
    let questions = useSelector(selectQuestionsForGame(id));
    const dispatch = useDispatch();

    useEffect(() => {
        if (!game) {
            dispatch(fetchGames(user.id, {includeQuestions: true}));
            dispatch(fetchQuestionsForGame(id));
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
                                questions.map(question => 
                                    <li>
                                        <EditQuestion question={question} addQuestion={addQuestion(id)} />
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