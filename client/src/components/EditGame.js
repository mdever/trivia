import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { selectGame, currentUserSelector, selectQuestionsForGame, selectAnswersForQuestion } from '../redux/selectors';
import { fetchGames, fetchQuestionsForGame, deleteAnswer } from '../redux/actions';

const answerStyle = {
    marginBottom: '0.5rem'
};

export function EditQuestion(props) {

    let [showNewAnswer, setShowNewAnswer] = useState(false);
    const answers = useSelector(selectAnswersForQuestion(props.question.id));
    const dispatch = useDispatch();

    const idx = props.idx;

    function addQuestion() {
        console.log('adding new question');
    }

    function doDeleteAnswer(answerId) {
        return function() {
            dispatch(deleteAnswer(answerId));
        }
    }
    

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
                    <div id="answers-list">
                    {
                    answers.map((answer, idx2) => 
                        <div style={answerStyle}>
                            <label htmlFor={'answer_' + idx + '_' + idx2}>Answer: </label>
                            <input type="text" value={answer.answer} />
                            <label htmlFor={'answer_correct_' + idx + '_' + idx2}>Correct</label>
                            <input type="checkbox" checked={answer.correct} />
                            <button style={{float: 'right'}}onClick={doDeleteAnswer(answer.id)}><img src="/clear.png" style={{height: '15px'}} /></button>
                        </div>   
                    )
                    }
                    {
                    showNewAnswer &&
                    <div style={answerStyle}>
                        New Answer form
                    </div>
                    }
                    <button onClick={() => setShowNewAnswer(!showNewAnswer)}><img src="/plus.png" style={{height: '15px'}} /></button>
            </div>
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

function NewQuestion() {
    return (
        <div>
            New Question
        </div>
    );
}

export default function EditGame(props) {
    let { id } = useParams();
    let game = useSelector(selectGame(id));
    let questions = useSelector(selectQuestionsForGame(id));
    const dispatch = useDispatch();
    let [showNewQuestionForm, setShowNewQuestionForm] = useState(false);



    useEffect(() => {
        if (!game) {
            dispatch(fetchGames({includeQuestions: true}));
            dispatch(fetchQuestionsForGame(id));
        }
    }, [id]);

    return (
        <div>
            { game && <h3>{game.name}</h3> }
            <h5>Questions</h5>
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
            { !showNewQuestionForm &&
            <div>
                <button className="btn btn-primary" onClick={ () => setShowNewQuestionForm(!showNewQuestionForm) }>Create</button>
            </div>
            }

            { showNewQuestionForm &&
            
            <NewQuestion game={game}/>

            }
            
        </div>
    )
}