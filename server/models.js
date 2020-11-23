const { DataTypes } = require('sequelize');

module.exports = function(sequelize) {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    const Game = sequelize.define('Game', {
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
    
    const Room = sequelize.define('Room', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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
            references: {
                model: User,
                key: 'id'
            }
        }
    });
    
    const Question = sequelize.define('Question', {
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
    
    const Answer = sequelize.define('Answer', {
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
            type: DataTypes.INTEGER,
            allowNull: false
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
    

    
    const UserSessions = sequelize.define('UserSessions', {
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
    
    Question.hasMany(Answer, {
        foreignKey: 'questionId'
    });
    Answer.belongsTo(Question, {
        foreignKey: 'questionId'
    });

    Question.belongsTo(Game, {
        foreignKey: 'gameId'
    });
    Room.hasMany(Question, {
        foreignKey: 'gameId'
    });

    User.belongsToMany(Room, { through: UserSessions, foreignKey: 'userId'  });
    Room.belongsToMany(User, { through: UserSessions, foreignKey: 'roomId' });
    
    Room.belongsTo(Game, {
        foreignKey: 'gameId'
    });
    Game.hasMany(Room, {
        foreignKey: 'gameId'
    });

    Game.belongsTo(User, {
        foreignKey: 'ownerId'
    });
    User.hasMany(Game, {
        foreignKey: 'ownerId'
    });
    

    return {
        User,
        Room,
        Game,
        UserSessions,
        Question,
        Answer
    }
}