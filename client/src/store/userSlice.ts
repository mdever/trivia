import { createAsyncThunk, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootStateOrAny } from "react-redux";
import { AppState } from ".";

export interface UserIdentity {
    username: string,
}

export interface UserSliceState {
    identity?: UserIdentity,
    token?: string,
    loading: boolean,
    error: string | null | undefined
}

export const registerNewUser = createAsyncThunk<{ user: { username: string, token: string }}, {username: string, password: string}>(
    'user/registerNewUser',
    async ({ username, password }, thunkAPI) => {
        try {
            const res = await axios.post('/users', {username, password});
            window.localStorage.setItem('username', res.data.username);
            window.localStorage.setItem('token', res.data.token);
            return {
                user: {
                    username: res.data.user.username,
                    token: res.data.token 
                }
            };
        } catch (err) {
            console.log('Got an error, dont know what to do exactly');
            throw ({
                message: 'Unable to register user'
            });
        }
    });

export const authenticateUser = createAsyncThunk<{ user: { username: string, token: string }}, { username: string, password: string }>(
    'user/authenticateUser',
    async ({username, password}, thunkAPI) => {
        try {

            const res = await axios.post('/sessions', {username, password});
            window.localStorage.setItem('username', res.data.user.username);
            window.localStorage.setItem('token', res.data.token);
            return {
                user: {
                    username: res.data.user.username,
                    token: res.data.token
                }
            }             
        } catch (err) {
            console.log('Got an error authenticating. Don\'t know what to do exactly');
            throw {
                message: 'Unable to authenticate'
            }
        }

    });

export const logoutAction = createAsyncThunk(
    'user/logout',
    async (_, thunkAPI) => {
        const state = thunkAPI.getState() as AppState;
        if (!state?.user?.token) {
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('token');
            return thunkAPI.rejectWithValue(false);
        }

        try {
            const response = await axios.delete('/sessions', {
                headers: {
                    'Authorization': `Bearer ${state.user.token}`
                }
            });
        } catch (err) {
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('token');
            throw err;
        }
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('token');
    });

const userSlice = createSlice({
    name: 'user',
    initialState: {
        identity: undefined,
        token: undefined,
        loading: false,
        error: null
    } as UserSliceState,
    reducers: {
        setUser: (state, action) => {
            state.identity = {
                username: action.payload.username
            };
            state.token = action.payload.token
        },
    },
    extraReducers: (builder) => {
        builder.addCase(registerNewUser.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerNewUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        builder.addCase(registerNewUser.fulfilled, (state, action: PayloadAction<{ user: {username: string, token: string }}>) => {
            state.identity = {
                username: action.payload.user.username
            };
            state.token = action.payload.user.token;
            state.loading = false;
            state.error = null;
        });
        builder.addCase(authenticateUser.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(authenticateUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        builder.addCase(authenticateUser.fulfilled, (state, action: PayloadAction<{ user: {username: string, token: string }}>) => {
            state.loading = false;
            state.error = null;
            state.identity = {
                username: action.payload.user.username,
            };
            state.token = action.payload.user.token
        });
        builder.addCase(logoutAction.fulfilled, (state, action) => {
            state.identity = undefined;
            state.token = undefined;
            state.loading = false;
            state.error = null;
        })
    }
});

export default userSlice.reducer;

export const {
    setUser
} = userSlice.actions;

export const selectUserSlice = (state: AppState) => state.user;
export const isAuthenticated = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.token
);
export const selectUsername = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.identity?.username
);
export const selectUserError = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.error
);
export const selectUserLoading = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.loading
);
export const selectToken = createSelector(
    selectUserSlice,
    (state: UserSliceState) => state.token
);

