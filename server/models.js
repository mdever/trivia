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
    
    Question.hasMany(Answer);
    Answer.belongsTo(Question);
    Question.belongsTo(Room);
    Room.hasMany(Question);
    
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
    
    User.belongsToMany(Room, { through: UserSessions });
    Room.belongsToMany(User, { through: UserSessions });
    

    return {
        User,
        Room,
        UserSessions,
        Question,
        Answer
    }
}