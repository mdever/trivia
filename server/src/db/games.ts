import e from 'express';
import db from '.';
import { AnswerDO, CreateAnswerRequest, CreateQuestionRequest, GameDO } from '../types';

const createNewGameProcedure = db.prepare('INSERT INTO games (name, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?)', (err) => {
    if (err) {
        console.log('Could not create stored procedure create-new-game');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
});

const getGamesByUserIdProcedure = db.prepare('SELECT * FROM games WHERE ownerId = ?', (err) => {
    if (err) {
        console.log('Could not create stored procedure get-games-by-user-id');
        console.log(err.stack);
        console.log(err.message);
        throw err;
    }
})

export async function createNewGame(name, userid): Promise<{ name: string, gameId: number }> {
    return new Promise((resolve, reject) => {
        const createdAt = (new Date()).toISOString();

        try {
            createNewGameProcedure.run(name, userid, createdAt, createdAt, function (err) {
                if (err) {
                    console.log('Error inserting game');
                    console.log(err);
                    reject('Could not insert game');
                    return;
                }

                resolve({
                    name,
                    gameId: this.lastID
                });
            });
        } catch (err) {
            console.log('Error inserting game');
            console.log(err);
            reject('Could not insert game');
            return;
        }
    });
}

export async function getGamesByUserId(userid: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
        try {
            getGamesByUserIdProcedure.all(userid, (err, rows) => {
                if (err) {
                    console.log('Error retrieving games');
                    console.log(err);
                    reject('Could not retrieve games');
                    return;
                }
                resolve(rows);
                return;
            })
        } catch (err) {
            console.log('Error retrieving games');
            console.log(err);
            reject('Could not retrieve games');
            return;
        }
    })
}

export async function getGetGameDetails(gameid: number): Promise<GameDO> {
    return new Promise(async (resolve, reject) => {
        db.get('SELECT * FROM games WHERE id = ?', gameid, async (err, row) => {
            if (err) {
                console.log(`Error retrieving game for Game ID ${gameid}`);
                console.log(err);
                reject(err);
                return;
            }
            if (!row) {
                console.log(`No Game found for Game ID ${gameid}`);
                reject('Game Not Found');
                return;
            }

            const {
                id: gid,
                ownerId,
                name: gameName,
                createdAt: gCreatedAt,
                updatedAt: gUpdatedAt
            } = row;

            try {
                let questions = await getQuestionsForGame(gameid);
                if (!questions) {
                    questions = [];
                }

                resolve({
                    id: gid,
                    ownerId,
                    name: gameName,
                    createdAt: gCreatedAt,
                    updatedAt: gUpdatedAt,
                    questions
                });

                return;
            } catch (err) {
                console.log('Error fetching questions for game ' + gameid);
                console.log(err);
                reject(err);
                return;
            }

        })
    });
}

export async function validateOwnershipOfGame(gameid: number, userid: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get('SELECT ownerId FROM games WHERE id = ?', gameid, (err, row) => {
            if (err) {
                resolve(false);
                return;
            }
            if (!row) {
                resolve(false)
                return;
            }
            if (row.ownerId === userid) {
                resolve(true)
                return;
            }
            resolve(false);
            return;
        })
    });
}

export async function getQuestionsForGame(gameid: number): Promise<{ id: number, question: string, hint?: string, index: number, gameId: number, createdAt: Date, updatedAt: Date, answers: { id: number, questionId: number, answer: string, index: number, correct: boolean, createdAt: Date, updatedAt: Date }[] }[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM Questions WHERE gameId = ? ORDER BY `index` asc', gameid, (err, questions) => {
            if (err) {
                console.log(`Error retrieving questions for Game ${gameid}`);
                console.log(err);
                reject(err);
                return;
            }

            if (!questions || questions.length === 0) {
                resolve([]);
                return;
            }

            const questionIds = questions.map(q => q.id );
            let questionMarkTemplate = '(';
            for (let i = 0; i < questionIds.length; i++) {
                questionMarkTemplate += '?'
                if (i !== questionIds.length - 1) {
                    questionMarkTemplate += ', ';
                }
            }
            questionMarkTemplate += ')'
            db.all('SELECT * FROM Answers WHERE questionId in ' + questionMarkTemplate, questionIds, (err, answers) => {
                if (err) {
                    console.log(`Error retrieving answers for questions ${questionIds}`);
                    console.log(err);
                    reject(err)
                }
                if (!answers) {
                    console.log("query to select answers returned no results");
                    answers = [];
                }
                const results = [];
                for (const q of questions) {
                    const answersForQuestion = (answers.filter(a => a.questionId === q.id) as any[]).sort((a1, a2) => a1.index > a2.index ? 1 : a1.index < a2.index ? -1 : 0).map(a => ({
                        id: a.id,
                        questionId: a.questionId,
                        answer: a.answer,
                        correct: a.correct === 1 ? true : false,
                        index: a.index,
                        createdAt: a.createdAt,
                        updatedAt: a.updatedAt
                    }));
                    results.push({
                        id: q.id,
                        gameId: q.gameId,
                        question: q.question,
                        hint: q.hint,
                        index: q.index,
                        answers: answersForQuestion,
                        createdAt: q.createdAt,
                        updatedAt: q.updatedAt
                    });
                }

                resolve(results);
                return;
            })
        })
    });
}

export async function insertNewQuestion(gameid: number, question: CreateQuestionRequest): Promise<{id: number, gameid: number, question: string, hint?: string, index: number, answers: { id: number, questionId: number, answer: string, index: number, correct: boolean }[]}> {
    return new Promise((resolve, reject) => {
        const createdAt = (new Date()).toISOString();
        db.run('INSERT INTO questions (gameId, question, `index`, hint, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', gameid, question.question, question.index, question.hint, createdAt, createdAt, function(err) {
            if (err) {
                console.log('Error inserting question in to the database');
                console.log(err);
                reject(err);
                return;
            }

            const qid = this.lastID;

            let valuesTemplate = '';
            if (question.answers && question.answers.length > 0) {
                if (question.answers.length > 1) {
                    for (let i = 0; i < question.answers.length; i++) {
                        if (i === 0) {
                            valuesTemplate += ('(?, ?, ?, ?, ?, ?)');
                        } else {
                            valuesTemplate += ', (?, ?, ?, ?, ?, ?)';
                        }

                    }
                }
                let queryString = 'INSERT INTO answers (answer, questionId, `index`, correct, createdAt, updatedAt) VALUES ' + valuesTemplate;
                console.log('Preparing statement ' + queryString);
                const insertAnswers = db.prepare(queryString, (err) => {
                    if (err) {
                        console.log('Error preparing statement for values insertion');
                        console.log(err);
                    }
                });

                if (!insertAnswers) {
                    reject('Could not create insert-answers prepared statement');
                }
                let i = 0;
                let args = question.answers.reduce((prev, next) => {
                    prev.push(next.answer);
                    prev.push(qid);
                    prev.push(i);
                    prev.push(next.correct);
                    prev.push(createdAt);
                    prev.push(createdAt);
                    i++
                    return prev;
                }, []) as any[];

                console.log('About to run insert-answers PS with arguments');
                console.log(args);
                insertAnswers.run(args, (err) => {
                    if (err) {
                        console.log('Error running insert-answers prepared statement');
                        console.log(err);
                        reject(err);
                        return;
                    }

                    db.all('SELECT * FROM answers WHERE questionId = ? ORDER BY `index` ASC', qid, (err, rows) => {
                        if (err) {
                            console.log('Error retrieving saved answers')
                            console.log(err);
                            reject(err);
                            return;
                        }

                        if (!rows || rows.length === 0) {
                            console.log('Retrieved no answers that I thought we previously inserted');
                            reject('Could not retrieve saved answers');
                            return;
                        }

                        const answers = rows.map(r => ({
                            id: r.id,
                            questionId: r.questionId,
                            answer: r.answer,
                            index: r.index,
                            correct: r.correct === 1 ? true : false
                        }));

                        const result = {
                            id: qid,
                            gameid: gameid,
                            question: question.question,
                            hint: question.hint,
                            index: question.index,
                            answers: answers
                        };

                        resolve(result);
                        return;
                    })
                });

            } else {
                resolve({
                    id: qid,
                    gameid: gameid,
                    question: question.question,
                    hint: question.hint,
                    index: question.index,
                    answers: []
                });
                return;
            }
        });
    })
}

export async function fetchAnswersForQuestion(questionid: number): Promise<AnswerDO[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM answers WHERE questionId = ?', questionid, (err, rows) => {
            if (err) {
                console.log(`Could not fetch answers for question ${questionid}`);
                console.log(err);
                reject(err);
                return;
            }

            if (!rows) {
                resolve([]);
                return;
            }

            resolve(rows);
            return;
        })
    });
}

export async function insertNewAnswer(questionid: number, answer: CreateAnswerRequest): Promise<{id: number, questionId: number, index: number, answer: string, correct: boolean, createdAt: Date, updatedAt: Date}> {
    return new Promise(async (resolve, reject) => {
        try {
            const existingAnswers = await fetchAnswersForQuestion(questionid);
            let index = answer.index;
            if (!index) {
                index = Math.max(...existingAnswers.map(a => a.index)) + 1;
            }
            while (existingAnswers.map(a => a.index).includes(index)) {
                index += 1;
            }
            const createdAt = (new Date());
            db.run('INSERT INTO Answers (answer, questionId, correct, `index`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', answer.answer, questionid, answer.correct, index, createdAt, createdAt, function(err) {
                if (err) {
                    console.log('Could not insert answer');
                    console.log(err);
                    reject(err);
                    return;
                }

                resolve({
                    id: this.lastID,
                    questionId: questionid,
                    answer: answer.answer,
                    index: index,
                    correct: answer.correct,
                    createdAt: createdAt,
                    updatedAt: createdAt
                });
                return;
            });
        } catch (err) {
            console.log(`Error inserting answer ${answer}`);
            console.log(err);
            reject(err);
            return;
        }
    });
}

export async function updateAnswer(answerid: number, answer: Partial<CreateAnswerRequest>): Promise<AnswerDO> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM answers WHERE id = ?', answerid, (err, row) => {
            if (err) {
                console.log(`Something went wrong fetch answer id ${answerid}`);
                console.log(err);
                reject(err);
            }

            if (!row) {
                console.log(`No row returned for answer id ${answerid}`);
                reject('NOT_FOUND');
                return;
            }

            const updatedAt = new Date();
            let newAnswer = {
                ...row,
                ...answer,
                id: row.id,
                questionId: row.questionId,
                correct: answer.correct === true ? 1 : answer.correct === false ? 0 : row.correct ? 1 : 0,
                updatedAt
            };

            db.run('UPDATE answers SET answer = ?, correct = ?, `index` = ?, updatedAt = ? WHERE id = ?', newAnswer.answer, newAnswer.correct, newAnswer.index, updatedAt, answerid, function(err) {
                if (err) {
                    console.log(`Error updating answer ${answerid}`);
                    console.log(err)
                    reject(err);
                    return;
                }

                resolve(newAnswer);
                return;
            })
        })
    });
}

export async function deleteAnswer(answerid: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM answers WHERE id = ?', answerid, function(err) {
            if (err) {
                console.log(`Error deleting answer id ${answerid}`);
                console.log(err);
                reject(err);
                return;
            }

            if (!this.lastID) {
                resolve(false);
            } else {
                resolve(true);
            }
        })
    })
}

export async function checkOwnershipOfGame(userid, gameid): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        db.get('SELECT ownerId FROM games where id = ?', gameid, (err, row) => {
            if (err) {
                console.log(`Error occurred fetching Game ID ${gameid}`);
                console.log(err);
                reject(err);
            }

            if (!row) {
                console.log(`No game found for gameId ${gameid}`);
                reject('NOT_FOUND');
                return;
            }

            if (row.ownerId !== userid) {
                resolve(false);
                return;
            } else {
                resolve(true);
                return;
            }
        })
    });
}

export async function fetchGameForAnswerId(answerid: number): Promise<number> {
    return new Promise(async (resolve, reject) => {
        db.get('SELECT questionId FROM answers where id = ?', answerid, (err, row) => {
            if (err) {
                console.log(`Error occurred fetching Game ID ${answerid}`);
                console.log(err);
                reject(err);
            }

            if (!row) {
                console.log(`No game found for gameId ${answerid}`);
                reject('NOT_FOUND');
                return;
            }

            db.get('SELECT gameId FROM questions WHERE id = ?', row.questionId, (err2, row2) => {
                if (err2) {
                    console.log(`Error occurred fetching Question ID ${row.questionId}`);
                    console.log(err2);
                    reject(err2);
                }

                if (!row2) {
                    console.log(`No question found for questionId ${row.questionId}`);
                    reject('NOT_FOUND');
                    return;
                }

                resolve(row2.gameId);
                return;
            })
        })
    });
}