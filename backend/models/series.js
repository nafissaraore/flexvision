// backend/models/series.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Series extends Model {
    static associate(models) {
      // Association existante avec les saisons
      Series.hasMany(models.Season, {
        foreignKey: 'seriesId',
        as: 'seasons',
      });
      // Nouvelle association avec UserFavorite pour les favoris
      Series.hasMany(models.UserFavorite, {
        foreignKey: 'seriesId',
        as: 'favoritedByUsers' // Cela permet de voir quels favoris pointent vers cette série
      });
    }
  }

  Series.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    genre: DataTypes.STRING,
    posterUrl: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Series',
  });

  return Series;
};