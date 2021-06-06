import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";
import { AppState } from ".";

export interface GameEntity {
    id: number,
    name: string
}

const gamesEntityAdapter = createEntityAdapter<GameEntity>()

export const createNewGame = createAsyncThunk<GameEntity, string>(
    'games/createNewGame',
    async (name: string, thunkAPI) => {
        const token = (thunkAPI.getState() as AppState).user.token;
        try {
            const res = await axios.post('/games', {
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

export const fetchGames = createAsyncThunk<GameEntity[]>(
    'games/fetchGames',
    async (_: string | void, thunkAPI) => {
        const token = (thunkAPI.getState() as AppState).user.token;
        const res = await axios.get('http://localhost:3000/games', {
            headers: {
                'Authorization': `Bearer: ${token}`
            }
        })
        return res.data.games;
    });

const gamesSlice = createSlice({
    name: 'games',
    initialState: {
        ...gamesEntityAdapter.getInitialState(),
        loading: false,
        error: false
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchGames.pending, (state, action) => {
            state.loading = true;
            state.error = false;
            gamesEntityAdapter.removeAll(state);
        });
        builder.addCase(fetchGames.rejected, (state, err: SerializedError | any) => {
            console.log('Error fetching games');
            console.log(err);
            state.loading = false;
            state.error = true;
            gamesEntityAdapter.removeAll(state);
        });
        builder.addCase(fetchGames.fulfilled, (state, action: PayloadAction<GameEntity[]>) => {
            state.loading = false;
            state.error = false;
            gamesEntityAdapter.addMany(state, action.payload);
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
            gamesEntityAdapter.addOne(state, action.payload);
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
} = gamesEntityAdapter.getSelectors(selectGamesSlice);