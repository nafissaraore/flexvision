'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Season extends Model {
    static associate(models) {
      Season.belongsTo(models.Series, {
       foreignKey: 'seriesId',
        as: 'series',
        
      });
      Season.hasMany(models.Episode, {
        foreignKey: 'seasonId',
        as: 'episodes',
      });
    }
  }

  Season.init({
    seriesId: DataTypes.INTEGER,
    seasonNumber: DataTypes.INTEGER,
    title: DataTypes.STRING,
    posterUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Season',
  });

  return Season;
};
