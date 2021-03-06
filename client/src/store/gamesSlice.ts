import { ChangeHistorySharp } from "@material-ui/icons";
import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";
import { AppState } from ".";

export interface GameEntity {
    id: number,
    name: string
}

export interface QuestionEntity {
    id: number,
    gameId: number,
    question: string,
    hint?: string,
    index: number
}

export interface AnswerEntity {
    id: number,
    questionId: number,
    answer: string,
    correct: boolean,
    index: number
}

export interface QuestionDetails extends QuestionEntity {
    answers: AnswerEntity[];
}

export interface GameDetails extends GameEntity {
    questions: QuestionDetails[]
}

const gamesEntityAdapter = createEntityAdapter<GameEntity>();
const questionsEntityAdapter = createEntityAdapter<QuestionEntity>();
const answersEntityAdapter = createEntityAdapter<AnswerEntity>();

export const createNewGame = createAsyncThunk<GameEntity, string>(
    'games/createNewGame',
    async (name: string, thunkAPI) => {
        const token = (thunkAPI.getState() as AppState).user.token;
        try {
            const res = await axios.post('/api/games', {
                name
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const game = res.data as GameEntity;
            return game;
        } catch (err) {
            console.log('Unable to create game');
            console.log(err);
            throw err;
        }
    });

export const createNewQuestion = createAsyncThunk(
    'games/createNewQuestion',
    async (newQuestionRequest: { gameid: number, question: string, index: number, hint: string }, thunkAPI) => {
        try {
            const token = (thunkAPI.getState() as AppState).user.token;
            const res = await axios.post(`/api/games/${newQuestionRequest.gameid}/questions`, {
               index: newQuestionRequest.index,
               answers: [],
               hint: newQuestionRequest.hint,
               question: newQuestionRequest.question
            },
            {
               headers: {
                   'Authorization': `Bearer ${token}`
               }
            });

            return res.data;
       } catch (err) {
           console.log(`An error occurred creating new answer ${newQuestionRequest}`);
           console.log(err);
           throw err;
       }
    }
)

export const fetchGames = createAsyncThunk<GameEntity[]>(
    'games/fetchGames',
    async (_: string | void, thunkAPI) => {
        const token = (thunkAPI.getState() as AppState).user.token;
        const res = await axios.get('/api/games', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data.games;
    });

export const fetchGameDetails = createAsyncThunk(
    'games/fetchGameDetails',
    async (gameid: number, thunkAPI) => {
        try {
            const token = (thunkAPI.getState() as AppState).user.token;
            const res = await axios.get(`/api/games/${gameid}/questions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return res.data;
        } catch (err) {
            console.log(`An error occurred fetching game details for Game ID: ${gameid}`);
            console.log(err);
            throw err;
        }
    });

export const patchAnswer = createAsyncThunk(
    'answers/patchAnswer',
    async (changeRequest: {id: number, gameid: number, changes: Partial<{answer: string, correct: boolean}>}, thunkAPI) => {
        try {
            const token = (thunkAPI.getState() as AppState).user.token;
            const res = await axios.patch(`/api/games/${changeRequest.gameid}/answers/${changeRequest.id}`, {
                answer: changeRequest.changes.answer,
                correct: changeRequest.changes.correct
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return res.data;
        } catch (err) {
            console.log(`An error occurred updating answer ${changeRequest.id}`);
            console.log(err);
            throw err;
        }
    }
)

export const createNewAnswer = createAsyncThunk(
    'answer/createNewAnswer',
    async (newAnswerRequest: { gameid: number, questionid: number, answer: string, index: number, correct: boolean }, thunkAPI) => {
        try {
             const token = (thunkAPI.getState() as AppState).user.token;
             const res = await axios.post(`/api/games/${newAnswerRequest.gameid}/questions/${newAnswerRequest.questionid}/answers`, {
                index: newAnswerRequest.index,
                answer: newAnswerRequest.answer,
                correct: newAnswerRequest.correct
             },
             {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
             });

             return res.data;
        } catch (err) {
            console.log(`An error occurred creating new answer ${newAnswerRequest}`);
            console.log(err);
            throw err;
        }
    });

export const deleteAnswer = createAsyncThunk<number, {gameid: number, answerid: number}>(
    'answers/deleteAnswer',
    async (deleteRequest, thunkAPI) => {
        try {
            const token = (thunkAPI.getState() as AppState).user.token;
            const res = await axios.delete(`/api/games/${deleteRequest.gameid}/answers/${deleteRequest.answerid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return res.data.answerid as number;
        } catch (err) {
            console.log(`An error occurred deleting answer ${deleteRequest.answerid}`);
            console.log(err);
            throw err;
        }
    }
)

const gamesSlice = createSlice({
    name: 'games',
    initialState: {
        games: gamesEntityAdapter.getInitialState(),
        questions: questionsEntityAdapter.getInitialState(),
        answers: answersEntityAdapter.getInitialState(),
        loading: false,
        error: false
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchGames.pending, (state, action) => {
            state.loading = true;
            state.error = false;
            gamesEntityAdapter.removeAll(state.games);
        });
        builder.addCase(fetchGames.rejected, (state, err: SerializedError | any) => {
            console.log('Error fetching games');
            console.log(err);
            state.loading = false;
            state.error = true;
            gamesEntityAdapter.removeAll(state.games);
        });
        builder.addCase(fetchGames.fulfilled, (state, action: PayloadAction<GameEntity[]>) => {
            state.loading = false;
            state.error = false;
            gamesEntityAdapter.addMany(state.games, action.payload);
        });
        builder.addCase(createNewGame.pending, (state, action) => {
            state.loading = true;
            state.error = false
        });
        builder.addCase(createNewGame.rejected, (state, action) => {
            state.loading = false;
            state.error = true;
        });
        builder.addCase(createNewGame.fulfilled, (state, action: PayloadAction<GameEntity>) => {
            state.loading = false;
            state.error = false;
            gamesEntityAdapter.addOne(state.games, action.payload);
        });
        builder.addCase(fetchGameDetails.pending, (state, action) => {
            state.loading = true;
            state.error = false;
        });
        builder.addCase(fetchGameDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = true;
        });
        builder.addCase(fetchGameDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.error = false;
            const response = action.payload;
            for (const q of response) {
                const { createdAt, updatedAt, answers, ...question} = q;
                questionsEntityAdapter.upsertOne(state.questions, question);

                for (const a of answers) {
                    const { createdAt, updatedAt, ...answer } = a;
                    answersEntityAdapter.upsertOne(state.answers, answer);
                }
            }
        });
        builder.addCase(patchAnswer.fulfilled, (state, action) => {
            state.loading = false;
            state.error = false;
            answersEntityAdapter.upsertOne(state.answers, action.payload);
        });
        builder.addCase(deleteAnswer.fulfilled, (state, action) => {
            state.loading = false;
            state.error = false;
            answersEntityAdapter.removeOne(state.answers, action.payload);
        });
        builder.addCase(createNewAnswer.fulfilled, (state, action) => {
            state.loading = false;
            state.error = false;
            answersEntityAdapter.addOne(state.answers, action.payload);
        })
        builder.addCase(createNewQuestion.fulfilled, (state, action) => {
            state.loading = false;
            state.error = false;
            questionsEntityAdapter.addOne(state.questions, action.payload);
        })
    }
});

export type GamesState = ReturnType<typeof gamesSlice.reducer>;

export default gamesSlice.reducer;
export const selectGamesSlice = (state: AppState) => state.games;
export const selectGamesLoading = createSelector(
    selectGamesSlice,
    (slice) => slice.loading
);
export const selectGamesError = createSelector(
    selectGamesSlice,
    (slice: GamesState) => slice.error
);

export const {
    selectAll: selectAllGames,
    selectById: selectGameById,
    selectIds: selectGameIds,
    selectEntities: selectGameEntities,
    selectTotal: selectGameTotal
} = gamesEntityAdapter.getSelectors((state: AppState) => selectGamesSlice(state).games);

export const {
    selectAll: selectAllQuestions,
    selectById: selectQuestionById,
    selectIds: selectQuestionIds,
    selectEntities: selectQuestionEntities,
    selectTotal: selectQuestionTotal
} = questionsEntityAdapter.getSelectors((state: AppState) => selectGamesSlice(state).questions);

export const {
    selectAll: selectAllAnswers,
    selectById: selectAnswerById,
    selectIds: selectAnswerIds,
    selectEntities: selectAnswerEntities,
    selectTotal: selectAnswerTotal
} = answersEntityAdapter.getSelectors((state: AppState) => selectGamesSlice(state).answers);

export const selectQuestionsForGame = (gameid: number) => createSelector(
    (state: AppState) => selectAllQuestions(state),
    (state: AppState) => selectAllAnswers(state),
    (questions, answers) => questions.filter(q => q.gameId === gameid).map(q => ({...q, answers: answers.filter(a => a.questionId === q.id)}))
)

export const selectGameDetails = (gameid: number) => createSelector(
    (state: AppState) => selectGameById(state, gameid),
    (state: AppState) => selectQuestionsForGame(gameid)(state),
    (game, questions) => {
        if (!game)
            return null;
        return {
            ...game,
            questions
        };
    }
)