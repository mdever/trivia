import { createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";
import { AppState } from ".";

export interface GameEntity {
    id: number,
    name: string,
    ownerId: number
}

const gamesEntityAdapter = createEntityAdapter<GameEntity>()

export const fetchGames = createAsyncThunk<GameEntity[]>(
    'games/fetchGames',
    async (_: string | void, thunkAPI) => {
        const res = await axios.get('http://localhost:3000/games', {
            headers: {
                'Authorization': 'Bearer d8cb9f608df83d44286651f23c36b18e22480f1cc8f83e154cf66ed56aea3aa5d122cf25730e905eee2688ccc8ffe9c0cc737ec9377de760eb99eb4a6537112718e0f692114a13eb63f6c4843dbfb0ac4cff644969a77e6833881df34e26d25712c264abc6c8232d31a38b125bb19f50367637a124fc7abf201900845326caed'
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