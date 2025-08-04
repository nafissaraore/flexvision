
// Fichier : backend/routes/apiRoutes.js
// Description : Fichier central pour toutes les routes de l'API.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const movieController = require('../controllers/movieController');
const seriesController = require('../controllers/seriesController');
const favoritesController = require('../controllers/favoritesController');
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');

// --- Routes d'authentification (publiques) ---
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// --- Routes publiques (lecture sans authentification) ---
router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.get('/series', seriesController.getAllSeries);
router.get('/series/:id', seriesController.getSeriesById);

// --- Routes de recherche (publiques) ---
router.get('/search', searchController.searchAll);

// --- Middleware d'authentification (protège les routes ci-dessous) ---
router.use(authMiddleware);

// --- Routes protégées (pour les utilisateurs connectés) ---

// Routes des favoris
router.get('/favorites', favoritesController.getUserFavorites);
router.post('/favorites/movie', favoritesController.addMovieToFavorites);
router.delete('/favorites/movie/:movieId', favoritesController.removeMovieFromFavorites);
router.post('/favorites/series', favoritesController.addSeriesToFavorites);
router.delete('/favorites/series/:seriesId', favoritesController.removeSeriesFromFavorites);
router.get('/favorites/check/:type/:id', favoritesController.checkFavoriteStatus);

// Routes de gestion (ADMIN) - Note : Ajoutez un middleware `requireAdmin`
// pour protéger ces routes si ce n'est pas déjà fait.
// Exemple : router.post('/movies', authMiddleware.requireAdmin, movieController.createMovie);
router.post('/movies', movieController.createMovie);
router.put('/movies/:id', movieController.updateMovie);
router.delete('/movies/:id', movieController.deleteMovie);
router.post('/series', seriesController.createSeries);
router.put('/series/:id', seriesController.updateSeries);
router.delete('/series/:id', seriesController.deleteSeries);

module.exports = router;