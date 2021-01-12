import { FETCH_QUESTIONS_SUCCESS, CREATE_QUESTION_SUCCESS } from '../actionTypes';

const initialState = {
    byId: {},
    allIds: []
}

export function questionsReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_QUESTIONS_SUCCESS: {
            let questions = action.questions.map(q => (
                 { 
                    id: q.id,
                    question: q.question,
                    hint: q.hint,
                    index: q.index,
                    gameId: q.gameId,
                    createdAt: q.createdAt,
                    updatedAt: q.updatedAt
                })
            );
            let allIds = questions.map(q => q.id);
            let byId = questions.reduce((acc, next) => { acc[next.id] = next; return acc; }, {});
            return {
                ...state,
                allIds,
                byId
            }
        }
        case CREATE_QUESTION_SUCCESS: {
            let questions = action.payload.map(q => (
                { 
                   id: q.id,
                   question: q.question,
                   hint: q.hint,
                   index: q.index,
                   gameId: q.gameId,
                   createdAt: q.createdAt,
                   updatedAt: q.updatedAt
               })
           );
           let allIds = questions.map(q => q.id);
           let byId = questions.reduce((acc, next) => { acc[next.id] = next; return acc; }, {});
           return {
               ...state,
               allIds,
               byId
           }
            break;
        }
        default: {
            return state;
        }
    }
}