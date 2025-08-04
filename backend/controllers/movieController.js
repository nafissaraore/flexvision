// backend/controllers/movieController.js

const db = require('../models');
const Movie = db.Movie;

// Récupérer tous les films (avec options de recherche/filtre)
exports.getAllMovies = async (req, res) => {
  try {
    const { search, genre } = req.query; // Récupère les paramètres de requête 'search' et 'genre'
    const whereClause = {};

    if (search) {
      // Recherche insensible à la casse par titre
      whereClause.title = { [db.Sequelize.Op.like]: `%${search}%` };
    }

    if (genre) {
      whereClause.genre = { [db.Sequelize.Op.like]: `%${genre}%` }; // Recherche par genre
    }

    const movies = await Movie.findAll({
      where: whereClause, // Applique les conditions de recherche/filtre
      order: [['title', 'ASC']] // Tri par défaut par titre
    });
    res.status(200).json(movies);
  } catch (error) {
    console.error('Erreur lors de la récupération des films:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des films.', error: error.message });
  }
};

// Récupérer un film par ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Film non trouvé.' });
    }
    res.status(200).json(movie);
  } catch (error) {
    console.error('Erreur lors de la récupération du film:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du film.', error: error.message });
  }
};

// --- Fonctions CRUD pour l'ADMIN (à protéger avec un middleware d'authentification et d'autorisation) ---
exports.createMovie = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({ message: 'Film créé avec succès', movie: newMovie });
  } catch (error) {
    console.error('Erreur lors de la création du film:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du film.', error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const [updated] = await Movie.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedMovie = await Movie.findByPk(req.params.id);
      return res.status(200).json({ message: 'Film mis à jour avec succès', movie: updatedMovie });
    }
    throw new Error('Film non trouvé.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du film:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du film.', error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const deleted = await Movie.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Film supprimé avec succès' });
    }
    throw new Error('Film non trouvé.');
  } catch (error) {
    console.error('Erreur lors de la suppression du film:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du film.', error: error.message });
  }
};
