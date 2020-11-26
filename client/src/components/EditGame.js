import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectGame, currentUserSelector, selectQuestionsForGame } from '../redux/selectors';
import { fetchGames, fetchQuestionsForGame } from '../redux/actions';

export function EditQuestion(props) {

    const idx = props.idx;

    return (

        <div className="card">
            <div className="card-header" id={'heading_' + idx}>
                <h2 className="mb-0">
                    <button className="btn btn-link" onClick={() => document.querySelector('#question_' + idx).classList.toggle('show') } type="button" data-toggle="collapse" data-target={'#question_' + idx} aria-expanded="true" aria-controls={'question_' + props.question.idx}>
                        {props.question.question}
                    </button>
                </h2>
            </div>

            <div id={'question_' + idx} className="collapse" aria-labelledby={'heading_' + idx} data-parent="#questions-list">
                <div className="card-body">
                    Hint: {props.question.hint}
                </div>
            </div>
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
            dispatch(fetchGames({includeQuestions: true}));
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
                    <div className="accordion" id="questions-list">
                        { 
                            questions.map((question, idx) => 
                                <EditQuestion question={question} key={idx} idx={idx} addQuestion={addQuestion(id)} />
                            )
                        }
                    </div>
                </div>
            }
        </div>
    )
}