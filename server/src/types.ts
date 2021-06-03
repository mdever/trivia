export interface NewUserRequest {
    username: string;
    password: string;
}

export type LoginRequest = NewUserRequest;

export interface NewUserResponseSuccess {
    status: 'success',
    user: {
        username: string,
        token: string
    }
}

export interface NewUserResponseFailure {
    status: 'failure',
    error: {
        code: number,
        error: string,
        errorMessage: string
    }
}

export type NewUserResponse = NewUserResponseSuccess | NewUserResponseFailure;

export interface CreateGameRequest {
    name: string
}