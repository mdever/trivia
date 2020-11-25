export const currentRoomSelector = (state) =>  state.rooms.currentRoom;
  
export const currentUserSelector = (state) => state.users.currentUser;
  
export const newUserErrorSelector = (state) => state.users.error;

export const isLoadingSelector = (state) => state.loading.isLoading;

export const selectGame = id => state => state.games.games.find(game => game.id == id)

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

export const selectAnswersForQuestion = questionId => state => {
    return state.answers.allIds
        .map(id => state.answers.byId[id])
        .filter(a => a.questionId == questionId)
        .sort(sortOnIndex);
}