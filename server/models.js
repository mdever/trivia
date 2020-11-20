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
        owner_id: {
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
        game_id: {
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
        room_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Room,
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
        question_id: {
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
        user_id: {
            type: DataTypes.INTEGER,
            references: {
            model: User,
            key: 'id'
            }
        },
        room_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Room,
                key: 'id'
            }
        }
    });
    
    Question.hasMany(Answer);
    Answer.belongsTo(Question);

    Question.belongsTo(Room);
    Room.hasMany(Question);

    User.belongsToMany(Room, { through: UserSessions });
    Room.belongsToMany(User, { through: UserSessions });
    
    Room.belongsTo(Game);
    Game.hasMany(Room);

    Game.belongsTo(User, {
        foreignKey: 'owner_id'
    });
    User.hasMany(Game, {
        foreignKey: 'owner_id'
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