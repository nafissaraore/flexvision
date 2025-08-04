'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Episode extends Model {
    static associate(models) {
      Episode.belongsTo(models.Season, {
        foreignKey: 'seasonId',

        as: 'season',
      });
    }
  }

  Episode.init({
    seasonId: DataTypes.INTEGER,
    episodeNumber: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    duration: DataTypes.STRING,
    videoUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Episode',
  });

  return Episode;
};
