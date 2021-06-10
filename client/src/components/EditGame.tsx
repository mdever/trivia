import { Accordion, AccordionSummary, AccordionDetails, Grid, Input } from '@material-ui/core';
import React, { useState } from 'react';
import { AnswerEntity, GameDetails, patchAnswer, QuestionDetails } from '../store/gamesSlice';
import EditIcon from '@material-ui/icons/Edit';
import DeleteSharpIcon from '@material-ui/icons/DeleteSharp';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { useAppDispatch } from '../store';

function QuestionAccordion(props: {gameid: number, question: QuestionDetails, idx: number}) {
    const dispatch = useAppDispatch();
    const [editModes, setEditModes] = useState<{ [id: number]: boolean }>({});
    const [pendingChanges, setPendingChanges] = useState<{ [id: number]: {answer: string, correct: boolean} }>({});

    const answerRow = (gameid: number, answer: AnswerEntity, editMode: boolean, i: number) => {
        if (editMode) {
            return (<React.Fragment key={i}>
                <Grid item style={{paddingLeft: '3rem'}} xs={11}>
                    <Input type="text" defaultValue={answer.answer} onChange={(e) => setPendingChanges({...pendingChanges, [answer.id]: { ...pendingChanges[answer.id], answer: e.target.value }})}/>
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
                <Grid item style={{paddingLeft: '3rem'}} xs={11}>
                    {answer.index}. {answer.answer}
                </Grid>
                <Grid item xs={1}>
                    <EditIcon color="primary" style={{cursor: 'pointer'}} onClick={() => setEditModes({...editModes, [answer.id]: true})}/>
                    <DeleteSharpIcon style={{marginLeft: '1rem', cursor: 'pointer'}} color="error" />
                </Grid>                           
            </React.Fragment>);
        }
    }

    return (
        <Accordion style={{width: '100%'}} key={props.idx}>
            <AccordionSummary>{props.question.index}. {props.question.question}</AccordionSummary>
            <AccordionDetails>
            
                <Grid container spacing={3}>
                {
                    props.question.answers.map((a, i) =>
                        answerRow(props.gameid, a, editModes[a.id], i)
                    )
                }
               </Grid>

            </AccordionDetails>
        </Accordion>
    )
}

export default function EditGame(props: {game: GameDetails}) {
    const { game } = props;

    return (
        <div>
            <Accordion>
                <AccordionSummary>Questions:</AccordionSummary>
                <AccordionDetails>
                    {
                        game.questions.map((q, i) => 
                            <QuestionAccordion gameid={game.id} question={q} idx={i} />
                        )
                    }
                </AccordionDetails>
            </Accordion>
            <pre>
                {JSON.stringify(game, null, 2)}
            </pre>
        </div>

    );
}