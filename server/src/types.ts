import ws from "ws";

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

export interface GameSessionInfo { 
    server: ws.Server,
    owner: {
        websocket: any;
        userid: number;
        username: string
    },
    clients: {
        websocket: any,
        userid: number,
        username: string
    }[] 
}

export function allPlayers(gameSession: GameSessionInfo) {
    return gameSession.clients.map(c => c.websocket);
}

export function allConnected(gameSession: GameSessionInfo) {
    return [gameSession.owner, ...gameSession.clients].map(c => c.websocket);
}

export type GameStateType = 'AWAITING_PLAYERS' | 'AWAITING_ANSWERS' | 'AWAITING_REVEAL' | 'AWAITING_QUESTION';
export type OwnerAction = 'START_GAME' | 'SEND_QUESTION' | 'REVEAL_HINT' | 'REVEAL_ANSWER' | 'DETERMINE_CORRECT' | 'END_GAME'; /* In the event of a question whos answer needs to be interpreted in browser */
export type PlayerAction = 'PLAYER_JOINED' | 'SUBMIT_ANSWER' | 'SUBMIT_FREEFORM_ANSWER';

export const validNextStates: { 
    [currentState in GameStateType]: { 
        ownerActions: { 
            [nextAction in OwnerAction]: GameStateType[];
        };
        playerActions: { 
            [nextAction in PlayerAction]: GameStateType[];
        } 
    }
} = {
    'AWAITING_PLAYERS': {
        ownerActions: {
            'START_GAME': ['AWAITING_QUESTION'],
            'SEND_QUESTION': [],
            'REVEAL_HINT': [],
            'REVEAL_ANSWER': [],
            'DETERMINE_CORRECT': [],
            'END_GAME': []
        },
        playerActions: {
            'SUBMIT_ANSWER': [],
            'SUBMIT_FREEFORM_ANSWER': [],
            'PLAYER_JOINED': ['AWAITING_PLAYERS']
        }
    },
    'AWAITING_ANSWERS': {
        ownerActions: {
            'START_GAME': [],
            'SEND_QUESTION': [],
            'REVEAL_HINT': [
                'AWAITING_ANSWERS',
                'AWAITING_REVEAL'
            ],
            'REVEAL_ANSWER': [],
            'DETERMINE_CORRECT': [],
            'END_GAME': []
        },
        playerActions: {
            'SUBMIT_ANSWER': [
                'AWAITING_ANSWERS',
                'AWAITING_REVEAL'
            ],
            'SUBMIT_FREEFORM_ANSWER': [
                'AWAITING_ANSWERS',
                'AWAITING_REVEAL'
            ],
            'PLAYER_JOINED': []
        },
    },
    'AWAITING_REVEAL': {
        ownerActions: {
            'START_GAME': [],
            'SEND_QUESTION': [],
            'REVEAL_HINT': [
                'AWAITING_ANSWERS',
                'AWAITING_REVEAL'
            ],
            'REVEAL_ANSWER': ['AWAITING_QUESTION'],
            'DETERMINE_CORRECT': [],
            'END_GAME': []
        },
        playerActions: {
            'SUBMIT_ANSWER': [],
            'SUBMIT_FREEFORM_ANSWER': [],
            'PLAYER_JOINED': []
        }
    },
    'AWAITING_QUESTION': {
        ownerActions: {
            'START_GAME': [],
            'SEND_QUESTION': [
                'AWAITING_ANSWERS'
            ],
            'REVEAL_HINT': [],
            'REVEAL_ANSWER': [],
            'DETERMINE_CORRECT': [],
            'END_GAME': []
        },
        playerActions: {
            'SUBMIT_ANSWER': [],
            'SUBMIT_FREEFORM_ANSWER': [],
            'PLAYER_JOINED': []
        }
    }
}

export interface GameState {
    roomCode: string;
    gameId: number;
    ownerId: number;
    ownerName: string;
    players: {
        playerId: number;
        username: string;
        score: number;
        answers: {
            questionId: number;
            answer: string;
            correct: boolean;
        }[]
    }[];
    state: GameStateType;
    lastAction: PlayerAction | OwnerAction;
    previousQuestions: {
        questionId: number;
        question: string;
        hint?: string;
        correct: boolean;
    }[];
    currentQuestion?: {
        questionId: number;
        question: string;
        hint?: string;
        playerAnswers: {
            playerId: number;
            answer: string;
        }[]
    }
}