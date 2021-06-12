import { Accordion, AccordionSummary, AccordionDetails, Grid, Input } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { AnswerEntity, createNewAnswer, createNewGame, createNewQuestion, deleteAnswer, GameDetails, patchAnswer, QuestionDetails } from '../store/gamesSlice';
import EditIcon from '@material-ui/icons/Edit';
import DeleteSharpIcon from '@material-ui/icons/DeleteSharp';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import { useAppDispatch } from '../store';

function QuestionAccordion(props: {gameid: number, question: QuestionDetails, idx: number}) {
    const dispatch = useAppDispatch();
    const [editModes, setEditModes] = useState<{ [id: number]: boolean }>({});
    const [addMode, setAddMode] = useState(false);
    const [newAnswer, setNewAnswer] = useState('');
    const [newAnswerCorrect, setNewAnswerCorrect] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<{ [id: number]: {answer: string, correct: boolean} }>({});

    const answerRow = (gameid: number, answer: AnswerEntity, editMode: boolean, i: number) => {
        if (editMode) {
            return (<React.Fragment key={i}>
                <Grid item style={{paddingLeft: '3rem'}} xs={10}>
                    <Input type="text" defaultValue={answer.answer} onChange={(e) => setPendingChanges({...pendingChanges, [answer.id]: { ...pendingChanges[answer.id], answer: e.target.value }})}/>
                </Grid>
                <Grid item xs={1}>
                    <input type="checkbox" checked={pendingChanges[answer.id] ? pendingChanges[answer.id].correct : answer.correct } onChange={(e) => {
                        const newPendingChanges = {...pendingChanges, [answer.id]: { ...pendingChanges[answer.id], correct: pendingChanges[answer.id] ? !pendingChanges[answer.id].correct : !answer.correct }};
                        setPendingChanges(newPendingChanges);
                    }} />
                </Grid>
                <Grid item xs={1}>
                    <DoneIcon color="primary" style={{cursor: 'pointer'}} onClick={() => {
                        console.log(`Updating answer id ${answer.id} with new value ${pendingChanges[answer.id]}`);
                        dispatch(patchAnswer({id: answer.id, gameid, changes: {...pendingChanges[answer.id]}}));
                        let newState = pendingChanges;
                        delete newState[answer.id];
                        setPendingChanges(newState);
                        setEditModes({...editModes, [answer.id]: false})
                    }}/>
                    <ClearIcon style={{marginLeft: '1rem', cursor: 'pointer'}} color="action" onClick={() => {
                        let newState = pendingChanges;
                        delete newState[answer.id];
                        setPendingChanges(newState);
                        setEditModes({...editModes, [answer.id]: false});
                    }}/>
                </Grid>                           
            </React.Fragment>);
        } else {
            return (<React.Fragment key={i}>
                <Grid item style={{paddingLeft: '3rem'}} xs={10}>
                    {answer.index}. {answer.answer}
                </Grid>
                <Grid item xs={1}>
                    {
                        answer.correct &&
                        <span>Correct</span>
                    }
                </Grid>
                <Grid item xs={1}>
                    <EditIcon color="primary" style={{cursor: 'pointer'}} onClick={() => setEditModes({...editModes, [answer.id]: true})}/>
                    <DeleteSharpIcon onClick={() => {dispatch(deleteAnswer({gameid, answerid: answer.id}))}} style={{marginLeft: '1rem', cursor: 'pointer'}} color="error" />
                </Grid>                           
            </React.Fragment>);
        }
    }

    return (
        <Accordion style={{width: '100%', marginLeft: '1rem'}} key={props.idx}>
            <Grid container spacing={1}>
                <Grid item xs={11}>
                    <AccordionSummary>{props.question.index}. {props.question.question}</AccordionSummary>
                </Grid>
                <Grid item xs={1}>
                    <EditIcon color="primary" style={{cursor: 'pointer', marginTop: '0.7rem'}} />
                    <DeleteSharpIcon style={{marginLeft: '1rem', marginRight: '0.5rem', cursor: 'pointer'}} color="error" />
                </Grid>
            </Grid>

            <AccordionDetails>
            
                <Grid container spacing={3}>
                {
                    props.question.answers.map((a, i) =>
                        answerRow(props.gameid, a, editModes[a.id], i)
                    )
                }
                {
                    addMode &&
                    <Grid container style={{paddingLeft: '2.2rem'}}>
                        <Grid item xs={10}>
                            <Input type="text" name="answer" onChange={(e) => setNewAnswer(e.target.value)}/>
                        </Grid>
                        <Grid item xs={1}>
                            <input type="checkbox" name="correct" onChange={(e) => setNewAnswerCorrect(!newAnswerCorrect)} />
                        </Grid>
                        <Grid item xs={1}>
                            <DoneIcon color="primary" style={{cursor: 'pointer'}} onClick={() => {
                                let index = Math.max(...props.question.answers.map(a => a.index));
                                if (index < 0) {
                                    index = 1;
                                } else {
                                    index = index+1;
                                }
                                dispatch(createNewAnswer({ gameid: props.gameid, questionid: props.question.id, answer: newAnswer, correct: newAnswerCorrect, index }));
                                setNewAnswer('');
                                setNewAnswerCorrect(false);
                                setAddMode(false);
                            }}/>
                            <ClearIcon style={{marginLeft: '1rem', cursor: 'pointer'}} color="action" onClick={() => {
                                setNewAnswer('');
                                setNewAnswerCorrect(false);
                                setAddMode(false);
                            }}/>
                        </Grid>
                    </Grid>
                }
                {
                    !addMode &&
                    <Grid item xs={11} style={{paddingLeft: '2.2rem'}}>
                        <AddIcon color="primary" style={{cursor: 'pointer'}} onClick={() => setAddMode(true)}/>
                    </Grid>    
                }
               </Grid>

            </AccordionDetails>
        </Accordion>
    )
}

export default function EditGame(props: {game: GameDetails }) {
    const { game } = props;
    const [addMode, setAddMode] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newQuestionHint, setNewQuestionHint] = useState('');
    const dispatch = useAppDispatch();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Accordion>
                    <Grid container item xs={12} spacing={3}>

                        <Grid item xs={12}>
                            <h3>Questions:</h3>
                                {
                                    game.questions.map((q, i) => 
                                        <QuestionAccordion gameid={game.id} question={q} idx={i} />
                                    )
                                }
                        </Grid>
                        {
                            addMode &&
                            <Grid item xs={12} container>
                                <Grid item xs={11}>
                                    <Input type="text" name="newQuestion" onChange={(e) => setNewQuestion(e.target.value)} />
                                </Grid>
                                <Grid item xs={1}>
                                    <DoneIcon color="primary" style={{cursor: 'pointer'}} onClick={() => {
                                        let index = Math.max(...props.game.questions.map(a => a.index));
                                        if (index < 0) {
                                            index = 1;
                                        } else {
                                            index = index+1;
                                        }
                                        dispatch(createNewQuestion({ gameid: props.game.id, index, question: newQuestion, hint: newQuestionHint }));
                                        setNewQuestion('');
                                        setNewQuestionHint('');
                                        setAddMode(false);
                                    }}/>
                                    <ClearIcon style={{marginLeft: '1rem', cursor: 'pointer'}} color="action" onClick={() => {
                                        setNewQuestion('');
                                        setNewQuestionHint('');
                                        setAddMode(false);
                                    }}/>
                                </Grid>
                            </Grid>
                        }
                        {
                            !addMode &&
                            <Grid item xs={12}>
                                <AddIcon color="primary" style={{paddingLeft: '1rem', cursor: 'pointer'}} onClick={() => setAddMode(true)}/> 
                            </Grid>
                        }
                    </Grid>
                </Accordion>
            </Grid>
        </Grid>
    );
}