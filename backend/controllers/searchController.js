// backend/controllers/searchController.js

const { db } = require('../database'); // Assurez-vous que votre instance de base de données est exportée

/**
 * @desc Recherche de films par titre, description, et genre
 * @param {object} req - L'objet de requête Express
 * @param {object} res - L'objet de réponse Express
 */
exports.searchMovies = async (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  try {
    const moviesQuery = `
      SELECT id, title, posterUrl, 'movie' as type
      FROM Movies
      WHERE title LIKE ? OR description LIKE ? OR genre LIKE ?
    `;
    const movies = await db.all(moviesQuery, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(movies);
  } catch (error) {
    console.error('Erreur lors de la recherche de films:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la recherche de films.' });
  }
};

/**
 * @desc Recherche de séries par titre, description, et genre
 * @param {object} req - L'objet de requête Express
 * @param {object} res - L'objet de réponse Express
 */
exports.searchSeries = async (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;

  try {
    const seriesQuery = `
      SELECT id, title, posterUrl, 'series' as type
      FROM Series
      WHERE title LIKE ? OR description LIKE ? OR genre LIKE ?
    `;
    const series = await db.all(seriesQuery, [searchTerm, searchTerm, searchTerm]);
    res.status(200).json(series);
  } catch (error) {
    console.error('Erreur lors de la recherche de séries:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la recherche de séries.' });
  }
};
