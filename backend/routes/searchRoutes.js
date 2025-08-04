// backend/routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authenticateToken = require('../middleware/authMiddleware');

// Route protégée pour rechercher des films
router.get('/movies', authenticateToken, searchController.searchMovies);

// Route protégée pour rechercher des séries
router.get('/series', authenticateToken, searchController.searchSeries);

module.exports = router;
