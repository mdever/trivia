import { Accordion, AccordionSummary, AccordionDetails, Grid } from '@material-ui/core';
import { AnswerEntity, GameDetails, GameEntity, QuestionDetails, QuestionEntity } from '../store/gamesSlice';

function QuestionAccordion(props: {question: QuestionDetails}) {

    return (
        <Accordion>
            <AccordionSummary>{props.question.question}</AccordionSummary>
            {
                props.question.answers.map(a => 
                    <AccordionDetails>
                        <Grid container>
                            <Grid xs={3}>
                                One
                            </Grid>
                            <Grid xs={3}>
                                Two
                            </Grid>
                            <Grid xs={3}>
                                Three
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                )
            }
        </Accordion>
    )
}

export default function EditGame(props: {game: GameDetails}) {
    const { game } = props;

    return (
        <div>
            <Accordion>
                <AccordionSummary>{game.name}</AccordionSummary>
                <AccordionDetails>
                    {
                        game.questions.map(q => 
                            <QuestionAccordion question={q} />
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