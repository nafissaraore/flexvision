'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Movie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Un film peut être favori de plusieurs utilisateurs via le modèle UserFavorite
      Movie.hasMany(models.UserFavorite, {
        foreignKey: 'movieId',
        as: 'favoritedByUsers' // Permet de savoir quels enregistrements UserFavorite pointent vers ce film
      });
    }
  }
  Movie.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    releaseYear: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    genre: DataTypes.STRING,
    director: DataTypes.STRING,
    cast: DataTypes.STRING,
    posterUrl: DataTypes.STRING,
    trailerUrl: DataTypes.STRING,
    videoUrl: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Movie',
  });
  return Movie;
};