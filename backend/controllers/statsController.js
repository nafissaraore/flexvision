// backend/controllers/statsController.js
const { User, Movie, Series } = require('../models');

// Récupérer les statistiques de la plateforme
exports.getPlatformStats = async (req, res) => {
  try {
    // Données simulées pour le moment
    const stats = {
      totalUsers: 1542,
      activeSubscriptions: 1205,
      totalMovies: 356,
      totalSeries: 124,
      mostWatchedMovie: 'Inception',
      mostWatchedSeries: 'Le Jeu de la Dame',
    };

    // Dans une application réelle, vous feriez des requêtes à la base de données
    // pour obtenir les données précises, par exemple:
    // const totalUsers = await User.count();
    // const totalMovies = await Movie.count();
    // const const totalSeries = await Series.count();

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
