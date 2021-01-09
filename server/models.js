const { DataTypes } = require('sequelize');

let User;
let AuthToken;
let Game;
let Room;
let Question;
let Answer;
let UserSessions;

let loaded = false;

module.exports = function(sequelize) {

    if (!loaded) {

        User = sequelize.define('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            salt: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pwHash: {
                type: DataTypes.STRING,
                allowNull: false
            }
        });

        AuthToken = sequelize.define('AuthToken', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            loggedInAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            userId: {
                type: DataTypes.INTEGER,
                references: {
                    model: User,
                    key: 'id'
                }
            }
        })

        Game = sequelize.define('Game', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ownerId: {
                type: DataTypes.INTEGER,
                references: {
                    model: User,
                    key: 'id'
                }
            }
        })
        
        Room = sequelize.define('Room', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            code: {
                type: DataTypes.STRING
            },
            gameId: {
                type: DataTypes.INTEGER,
                references: {
                    model: Game,
                    key: 'id'
                }
            },
            winner: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: User,
                    key: 'id'
                }
            }
        });
        
        Question = sequelize.define('Question', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            question: {
                type: DataTypes.STRING,
                allowNull: false
            },
            hint: {
                type: DataTypes.STRING,
                allowNull: true
            },
            index: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            gameId: {
                type: DataTypes.INTEGER,
                references: {
                    model: Game,
                    key: 'id'
                }
            }
        });
        
        Answer = sequelize.define('Answer', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            answer: {
                type: DataTypes.STRING,
                allowNull: false
            },
            index: {
                type: DataTypes.INTEGER
            },
            correct: {
                type: DataTypes.BOOLEAN
            },
            questionId: {
                type: DataTypes.INTEGER,
                references: {
                    model: Question,
                    key: 'id'
                }
            }
        });
        

        
        UserSessions = sequelize.define('UserSessions', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                references: {
                model: User,
                key: 'id'
                }
            },
            roomId: {
                type: DataTypes.INTEGER,
                references: {
                    model: Room,
                    key: 'id'
                }
            }
        });

        User.hasOne(AuthToken, { foreignKey: 'userId' });
        
        Question.hasMany(Answer, {
            foreignKey: 'questionId'
        });
        Answer.belongsTo(Question, {
            foreignKey: 'questionId'
        })

        Game.hasMany(Question, {
            foreignKey: 'gameId'
        });
        Question.belongsTo(Game, {
            foreignKey: 'gameId'
        })

        User.belongsToMany(Room, { through: UserSessions, foreignKey: 'userId'  });
        Room.belongsToMany(User, { through: UserSessions, foreignKey: 'roomId' });
        
        Game.hasMany(Room, {
            foreignKey: 'gameId'
        });
        Room.belongsTo(Game, {
            foreignKey: 'gameId'
        })

        User.hasMany(Game, {
            foreignKey: 'ownerId'
        });
        Game.belongsTo(User, {
            foreignKey: 'ownerId'
        })

        loaded = true;
    }
    

    return {
        User,
        AuthToken,
        Room,
        Game,
        UserSessions,
        Question,
        Answer
    }
}