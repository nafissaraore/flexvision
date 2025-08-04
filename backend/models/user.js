// backend/models/user.js

'use strict';
const bcrypt = require('bcryptjs');
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserFavorite, {
        foreignKey: 'userId',
        as: 'favorites',
        onDelete: 'CASCADE',
      });
    }

    // Méthode pour comparer les mots de passe hachés
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
  }
  
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    hooks: {
      // Hook pour hacher le mot de passe SEULEMENT si il n'est pas déjà haché
      beforeCreate: async (user) => {
        if (user.password && !user.password.startsWith('$2')) {
          console.log('🔐 Hachage du mot de passe lors de la création');
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && !user.password.startsWith('$2')) {
          console.log('🔐 Hachage du mot de passe lors de la mise à jour');
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};