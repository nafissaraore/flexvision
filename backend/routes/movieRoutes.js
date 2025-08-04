// backend/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Routes d'administration protégées par les middlewares authMiddleware et isAdmin
router.post('/', authMiddleware, isAdmin, movieController.createMovie);
router.put('/:id', authMiddleware, isAdmin, movieController.updateMovie);
router.delete('/:id', authMiddleware, isAdmin, movieController.deleteMovie);

module.exports = router;