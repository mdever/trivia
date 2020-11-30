import { FETCH_QUESTIONS_SUCCESS, DELETE_ANSWER_SUCCESS } from '../actionTypes';

const initialState = {
    byId: {},
    allIds: []
};

export function answersReducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_QUESTIONS_SUCCESS: {
            let answers = action.questions.flatMap(q => {
                let answers = [];
                for (let a of q.Answers) {
                    answers.push(a);
                }
                return answers;
            });

            const allIds = answers.map(a => a.id);
            const byId = answers.reduce((acc, next) => { acc[next.id] = next; return acc; }, {});

            return {
                ...state,
                allIds,
                byId
            };
        }
        case DELETE_ANSWER_SUCCESS: {
            const answerId = action.payload.answerId;
            let remainingIds = state.allIds.filter(id => id != answerId);
            let answers = {};
            remainingIds.map(id => answers[id] = state.byId[id]);
            return {
                ...state,
                allIds: remainingIds,
                byId: answers
            }
        }
        default: {
            return state;
        }
    }
}