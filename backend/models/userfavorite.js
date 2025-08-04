'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFavorite extends Model {
    static associate(models) {
      // Association avec User
      UserFavorite.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Association avec Movie (optionnelle)
      UserFavorite.belongsTo(models.Movie, {
        foreignKey: 'movieId',
        as: 'movie'
      });
      
      // Association avec Series (optionnelle)
      UserFavorite.belongsTo(models.Series, {
        foreignKey: 'seriesId',
        as: 'series'
      });
    }
  }

  UserFavorite.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Movies',
        key: 'id'
      }
    },
    seriesId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Series',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'UserFavorites'
  });

  return UserFavorite;
};