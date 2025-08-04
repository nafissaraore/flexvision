// backend/controllers/favoritesController.js
const db = require('../models');
const UserFavorite = db.UserFavorite;
const Movie = db.Movie;
const Series = db.Series;
const Season = db.Season;
const Episode = db.Episode;

// Récupérer tous les favoris d'un utilisateur
exports.getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // ID de l'utilisateur provenant du middleware d'authentification

    const favorites = await UserFavorite.findAll({
      where: { userId: userId },
      include: [
        {
          model: Movie,
          as: 'movie',
          attributes: ['id', 'title', 'posterUrl', 'genre', 'description']
        },
        {
          model: Series,
          as: 'series',
          attributes: ['id', 'title', 'posterUrl', 'genre', 'description'],
          include: [ // Inclure saisons et épisodes pour la page de détails des favoris si nécessaire
            {
              model: Season,
              as: 'seasons',
              attributes: ['id', 'seasonNumber', 'title'],
              include: [{ model: Episode, as: 'episodes', attributes: ['id', 'episodeNumber', 'title'] }]
            }
          ]
        }
      ]
    });

    // Filtrer pour séparer les films et les séries favoris
    const favoriteMovies = favorites.filter(fav => fav.movie !== null).map(fav => fav.movie);
    const favoriteSeries = favorites.filter(fav => fav.series !== null).map(fav => fav.series);

    res.status(200).json({ movies: favoriteMovies, series: favoriteSeries });
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des favoris.', error: error.message });
  }
};

// Ajouter un film aux favoris
exports.addMovieToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: 'L\'ID du film est requis.' });
    }

    const existingFavorite = await UserFavorite.findOne({
      where: { userId, movieId, seriesId: null } // S'assurer que c'est bien un film
    });

    if (existingFavorite) {
      return res.status(409).json({ message: 'Ce film est déjà dans vos favoris.' });
    }

    const favorite = await UserFavorite.create({ userId, movieId });
    res.status(201).json({ message: 'Film ajouté aux favoris.', favorite });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du film aux favoris:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du film aux favoris.', error: error.message });
  }
};

// Ajouter une série aux favoris
exports.addSeriesToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { seriesId } = req.body;

    if (!seriesId) {
      return res.status(400).json({ message: 'L\'ID de la série est requis.' });
    }

    const existingFavorite = await UserFavorite.findOne({
      where: { userId, seriesId, movieId: null } // S'assurer que c'est bien une série
    });

    if (existingFavorite) {
      return res.status(409).json({ message: 'Cette série est déjà dans vos favoris.' });
    }

    const favorite = await UserFavorite.create({ userId, seriesId });
    res.status(201).json({ message: 'Série ajoutée aux favoris.', favorite });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la série aux favoris:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la série aux favoris.', error: error.message });
  }
};

// Retirer un film des favoris
exports.removeMovieFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params; // L'ID du film est dans les paramètres de l'URL

    const deleted = await UserFavorite.destroy({
      where: { userId, movieId: movieId, seriesId: null }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Film non trouvé dans les favoris.' });
    }
    res.status(200).json({ message: 'Film retiré des favoris.' });
  } catch (error) {
    console.error('Erreur lors du retrait du film des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur lors du retrait du film des favoris.', error: error.message });
  }
};

// Retirer une série des favoris
exports.removeSeriesFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { seriesId } = req.params; // L'ID de la série est dans les paramètres de l'URL

    const deleted = await UserFavorite.destroy({
      where: { userId, seriesId: seriesId, movieId: null }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Série non trouvée dans les favoris.' });
    }
    res.status(200).json({ message: 'Série retirée des favoris.' });
  } catch (error) {
    console.error('Erreur lors du retrait de la série des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur lors du retrait de la série des favoris.', error: error.message });
  }
};

// Vérifier si un film/série est en favori pour l'utilisateur actuel
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params; // type sera 'movie' ou 'series', id est l'ID du contenu

    let isFavorite = false;
    if (type === 'movie') {
      const favorite = await UserFavorite.findOne({
        where: { userId, movieId: id, seriesId: null }
      });
      isFavorite = !!favorite; // Convertit en booléen
    } else if (type === 'series') {
      const favorite = await UserFavorite.findOne({
        where: { userId, seriesId: id, movieId: null }
      });
      isFavorite = !!favorite;
    } else {
      return res.status(400).json({ message: 'Type de contenu invalide (doit être "movie" ou "series").' });
    }

    res.status(200).json({ isFavorite });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut des favoris:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification du statut des favoris.', error: error.message });
  }
};