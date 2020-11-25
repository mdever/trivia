export const currentRoomSelector = (state) =>  state.rooms.currentRoom;
  
export const currentUserSelector = (state) => state.users.currentUser;
  
export const newUserErrorSelector = (state) => state.users.error;

export const isLoadingSelector = (state) => state.loading.isLoading;

export const selectGame = id => state => state.games.games.find(game => game.id == id)

export const selectQuestionsForGame = gameId => state => {
    let questions = [];
    for (let qid of state.questions.allIds) {
        let question = state.questions.byId[qid];
        questions.push(question);
    }

    return questions;
}
