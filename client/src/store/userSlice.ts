import { createSelector, createSlice } from "@reduxjs/toolkit";
import { AppState } from ".";

export interface UserIdentity {
    username: string,
}

export interface UserSliceState {
    identity?: UserIdentity,
    token?: string
}

const userSlice = createSlice({
    name: 'user',
    initialState: {} as UserSliceState,
    reducers: {

    },
    extraReducers: (builder) => {

    }
});

export default userSlice.reducer;

export const {

} = userSlice.actions;

export const selectUserSlice = (state: AppState) => state.user;
export const isAuthenticated = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.token
)