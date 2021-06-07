import db from '.';
import { CreateQuestionRequest } from '../types';

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

export async function getQuestionsForGame(gameid: number): Promise<{ id: number, question: string, hint?: string, index: number, gameid: number, answers: { id: number, answer: string, index: number, correct: boolean }[] }[]> {
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
                        index: a.index
                    }));
                    results.push({
                        id: q.id,
                        gameId: q.gameId,
                        question: q.question,
                        hint: q.hint,
                        index: q.index,
                        answers: answersForQuestion
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