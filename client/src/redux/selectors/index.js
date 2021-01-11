import { createSelector } from 'reselect';
import cloneDeep from 'lodash/cloneDeep';

export const currentRoomSelector = (state) =>  state.rooms.currentRoom;
  
export const currentUserSelector = (state) => state.users.currentUser;
  
export const newUserErrorSelector = (state) => state.users.error;

export const isLoadingSelector = (state) => state.loading.isLoading;

export const selectGame = id => state => state.games.games.find(game => game.id == id)

export const loggedInSelector = state => state.users.currentUser && state.users.currentUser.token;

function sortOnIndex(el1, el2) {
    if (el1.index > el2.index) {
        return 1;
    } else if (el1.index < el2.index) {
        return -1;
    } else {
        return 0;
    }
}

export const selectQuestionsForGame = gameId => state => {
    return state.questions.allIds
        .map(id => state.questions.byId[id])
        .filter(q => q.gameId == gameId)
        .sort(sortOnIndex);
}

export const selectAnswersForQuestion = questionId => {
    return createSelector(
        state => state.answers,
        answers => {
            let newAnswers = cloneDeep(answers);
            newAnswers = newAnswers.allIds
                .map(id => Object.assign({}, { ...answers.byId[id]} ))
                .filter(a => a.questionId == questionId)
                .sort(sortOnIndex);

            return newAnswers;
        }
            
    )
}

export const selectCurrentRoom = state => state.rooms.currentRoom;
export const isOwnerSelector = createSelector(
    selectCurrentRoom,
    (room) => room && room.isOwner
)