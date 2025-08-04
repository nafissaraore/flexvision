// backend/routes/seriesRoutes.js
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', seriesController.getAllSeries);
router.get('/:id', seriesController.getSeriesById);
router.get('/seasons/:seriesId', seriesController.getSeasonsBySeriesId);
router.get('/episodes/:seasonId', seriesController.getEpisodesBySeasonId);
router.get('/episode/:id', seriesController.getEpisodeById);

// Routes d'administration pour les séries (protégées)
router.post('/', authMiddleware, isAdmin, seriesController.createSeries);
router.put('/:id', authMiddleware, isAdmin, seriesController.updateSeries);
router.delete('/:id', authMiddleware, isAdmin, seriesController.deleteSeries);

// Routes d'administration pour les saisons et épisodes (protégées)
router.post('/seasons', authMiddleware, isAdmin, seriesController.createSeason);
router.post('/episodes', authMiddleware, isAdmin, seriesController.createEpisode);

module.exports = router;