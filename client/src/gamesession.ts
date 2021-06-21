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