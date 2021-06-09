export interface NewUserRequest {
    username: string;
    password: string;
}

export type LoginRequest = NewUserRequest;

export interface NewUserResponseSuccess {
    status: 'success',
    token: string,
    user: {
        username: string,
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

export interface CreateQuestionRequest {
    index?: number,
    question: string,
    hint?: string,
    answers?: {
        answer: string,
        correct: boolean
    }[]
}

export interface CreateAnswerRequest {
    index?: number,
    answer: string,
    correct: boolean
}

export interface AnswerDO {
    id: number,
    questionId: number,
    answer: string,
    correct: boolean,
    index: number,
    createdAt: Date,
    updatedAt: Date
}

export interface QuestionDO {
    id: number,
    gameId: number,
    index: number,
    question: string,
    hint?: string,
    createdAt: Date,
    updatedAt: Date,
    answers: AnswerDO[]
}

export interface GameDO {
    id: number,
    ownerId: number,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    questions: QuestionDO[]
}