// backend/routes/api.js

const express = require('express');
const router = express.Router();
// Gardez la connexion à la base de données ici, car elle est utilisée par les autres routes
const db = require('../db'); 

// --- IMPORTS ESSENTIELS POUR L'AUTHENTIFICATION ---
// Importez votre contrôleur d'authentification
const authController = require('../controllers/authController');
// Importez votre middleware d'authentification
const authMiddleware = require('../middleware/authMiddleware'); 

// --- SUPPRESSION : Retirez ces imports, car la logique d'auth est dans authController ---
// const bcrypt = require('bcryptjs'); 
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');

// --- Routes d'Authentification (UTILISENT authController.js) ---
// Ces routes délèguent maintenant leur logique au authController
router.post('/auth/signup', authController.signup);
router.post('/auth/signin', authController.signin);


// --- Routes Films (protégées par authMiddleware) ---

// Récupérer tous les films avec options de recherche et de genre
router.get('/movies', authMiddleware, async (req, res) => {
    const { search, genre } = req.query; 

    let sql = 'SELECT * FROM Movies WHERE 1=1'; 
    const params = [];

    if (search) {
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
    }
    if (genre) {
        sql += ' AND genre LIKE ?'; 
        params.push(`%${genre}%`);
    }

    try {
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des films.' });
    }
});

// Récupérer un film par ID
router.get('/movies/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM Movies WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Film non trouvé.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du film:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du film.' });
    }
});


// --- Routes Séries (protégées par authMiddleware) ---

// Récupérer toutes les séries avec options de recherche et de genre
router.get('/series', authMiddleware, async (req, res) => {
    const { search, genre } = req.query; 

    let sql = 'SELECT * FROM Series WHERE 1=1'; 
    const params = [];

    if (search) {
        sql += ' AND title LIKE ?';
        params.push(`%${search}%`);
    }
    if (genre) {
        sql += ' AND genre LIKE ?'; 
        params.push(`%${genre}%`);
    }

    try {
        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des séries:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des séries.' });
    }
});

// Récupérer une série par ID avec ses saisons et épisodes
router.get('/series/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const [seriesRows] = await db.execute('SELECT * FROM Series WHERE id = ?', [id]);
        if (seriesRows.length === 0) {
            return res.status(404).json({ message: 'Série non trouvée.' });
        }

        const series = seriesRows[0];

        const [seasonsRows] = await db.execute('SELECT id, series_id, seasonNumber, title FROM Seasons WHERE series_id = ? ORDER BY seasonNumber', [id]);
        const seasons = [];

        for (const season of seasonsRows) {
            const [episodesRows] = await db.execute('SELECT id, season_id, episodeNumber, title, description, videoUrl FROM Episodes WHERE season_id = ? ORDER BY episodeNumber', [season.id]);
            seasons.push({ ...season, episodes: episodesRows });
        }

        res.json({ ...series, seasons });

    } catch (error) {
        console.error('Erreur lors de la récupération de la série avec saisons et épisodes:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de la série.' });
    }
});


// --- Routes Favoris (protégées par authMiddleware) ---

// Ajouter un film aux favoris
router.post('/favorites/movie', authMiddleware, async (req, res) => {
    const { movieId } = req.body;
    const userId = req.user.id; 

    if (!movieId) {
        return res.status(400).json({ message: 'Movie ID est requis.' });
    }

    try {
        const [existingFavorite] = await db.execute(
            'SELECT id FROM UserFavorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (existingFavorite.length > 0) {
            return res.status(409).json({ message: 'Ce film est déjà dans vos favoris.' });
        }

        await db.execute(
            'INSERT INTO UserFavorites (user_id, movie_id, series_id) VALUES (?, ?, NULL)',
            [userId, movieId]
        );
        res.status(201).json({ message: 'Film ajouté aux favoris.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du film aux favoris:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du film aux favoris.' });
    }
});

// Ajouter une série aux favoris
router.post('/favorites/series', authMiddleware, async (req, res) => {
    const { seriesId } = req.body;
    const userId = req.user.id; 

    if (!seriesId) {
        return res.status(400).json({ message: 'Series ID est requis.' });
    }

    try {
        const [existingFavorite] = await db.execute(
            'SELECT id FROM UserFavorites WHERE user_id = ? AND series_id = ?',
            [userId, seriesId]
        );

        if (existingFavorite.length > 0) {
            return res.status(409).json({ message: 'Cette série est déjà dans vos favoris.' });
        }

        await db.execute(
            'INSERT INTO UserFavorites (user_id, movie_id, series_id) VALUES (?, NULL, ?)',
            [userId, seriesId]
        );
        res.status(201).json({ message: 'Série ajoutée aux favoris.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la série aux favoris:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la série aux favoris.' });
    }
});

// Retirer un film des favoris
router.delete('/favorites/movie/:movieId', authMiddleware, async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id; 

    try {
        const [result] = await db.execute(
            'DELETE FROM UserFavorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Film non trouvé dans les favoris de l\'utilisateur.' });
        }

        res.json({ message: 'Film retiré des favoris.' });
    } catch (error) {
        console.error('Erreur lors du retrait du film des favoris:', error);
        res.status(500).json({ message: 'Erreur serveur lors du retrait du film des favoris.' });
    }
});

// Retirer une série des favoris
router.delete('/favorites/series/:seriesId', authMiddleware, async (req, res) => {
    const { seriesId } = req.params;
    const userId = req.user.id; 

    try {
        const [result] = await db.execute(
            'DELETE FROM UserFavorites WHERE user_id = ? AND series_id = ?',
            [userId, seriesId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Série non trouvée dans les favoris de l\'utilisateur.' });
        }

        res.json({ message: 'Série retirée des favoris.' });
    } catch (error) {
        console.error('Erreur lors du retrait de la série des favoris:', error);
        res.status(500).json({ message: 'Erreur serveur lors du retrait de la série des favoris.' });
    }
});

// Vérifier si un film est en favori
router.get('/favorites/check/movie/:movieId', authMiddleware, async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id; 

    try {
        const [rows] = await db.execute(
            'SELECT id FROM UserFavorites WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );
        res.json({ isFavorite: rows.length > 0 });
    } catch (error) {
        console.error('Erreur lors de la vérification du statut du film favori:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la vérification du statut du film favori.' });
    }
});

// Vérifier si une série est en favori
router.get('/favorites/check/series/:seriesId', authMiddleware, async (req, res) => {
    const { seriesId } = req.params;
    const userId = req.user.id; 

    try {
        const [rows] = await db.execute(
            'SELECT id FROM UserFavorites WHERE user_id = ? AND series_id = ?',
            [userId, seriesId]
        );
        res.json({ isFavorite: rows.length > 0 });
    } catch (error) {
        console.error('Erreur lors de la vérification du statut de la série favorite:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la vérification du statut de la série favorite.' });
    }
});

// Récupérer tous les favoris de l'utilisateur (films et séries)
router.get('/favorites', authMiddleware, async (req, res) => {
    const userId = req.user.id; 

    try {
        const [favoriteMovies] = await db.execute(
            'SELECT m.* FROM Movies m JOIN UserFavorites uf ON m.id = uf.movie_id WHERE uf.user_id = ?',
            [userId]
        );

        const [favoriteSeries] = await db.execute(
            'SELECT s.* FROM Series s JOIN UserFavorites uf ON s.id = uf.series_id WHERE uf.user_id = ?',
            [userId]
        );

        res.json({ movies: favoriteMovies, series: favoriteSeries });
    } catch (error) {
        console.error('Erreur lors de la récupération des favoris de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des favoris.' });
    }
});


// --- Routes de Recherche (protégées par authMiddleware) ---

// Rechercher des films par titre
router.get('/search/movies', authMiddleware, async (req, res) => {
    const { query } = req.query; 

    if (!query) {
        return res.status(400).json({ message: 'Un terme de recherche (query) est requis.' });
    }

    try {
        const [movies] = await db.execute('SELECT * FROM Movies WHERE title LIKE ?', [`%${query}%`]);
        res.json(movies);
    } catch (error) {
        console.error('Erreur lors de la recherche de films:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche de films.' });
    }
});

// Rechercher des séries par titre
router.get('/search/series', authMiddleware, async (req, res) => {
    const { query } = req.query; 

    if (!query) {
        return res.status(400).json({ message: 'Un terme de recherche (query) est requis.' });
    }

    try {
        const [series] = await db.execute('SELECT * FROM Series WHERE title LIKE ?', [`%${query}%`]);
        res.json(series);
    } catch (error) {
        console.error('Erreur lors de la recherche de séries:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la recherche de séries.' });
    }
});


// --- Routes Visionnage (protégées par authMiddleware) ---

// Enregistrer un visionnage de film
router.post('/watch-history/movie', authMiddleware, async (req, res) => {
    const { movieId } = req.body;
    const userId = req.user.id; 

    if (!movieId) {
        return res.status(400).json({ message: 'Movie ID est requis.' });
    }

    try {
        await db.execute(
            'INSERT INTO WatchHistory (user_id, movie_id, series_id, episode_id) VALUES (?, ?, NULL, NULL)',
            [userId, movieId]
        );
        res.status(201).json({ message: 'Historique de film enregistré.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'historique du film:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement de l\'historique.' });
    }
});

// Enregistrer un visionnage de série/épisode
router.post('/watch-history/series/:seriesId/episode/:episodeId', authMiddleware, async (req, res) => {
    const { seriesId, episodeId } = req.params;
    const userId = req.user.id; 

    if (!seriesId || !episodeId) {
        return res.status(400).json({ message: 'Series ID et Episode ID sont requis.' });
    }

    try {
        await db.execute(
            'INSERT INTO WatchHistory (user_id, movie_id, series_id, episode_id) VALUES (?, NULL, ?, ?)',
            [userId, seriesId, episodeId]
        );
        res.status(201).json({ message: 'Historique de série/épisode enregistré.' });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'historique de la série/épisode:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement de l\'historique.' });
    }
});

// Récupérer l'historique de visionnage de l'utilisateur
router.get('/watch-history', authMiddleware, async (req, res) => {
    const userId = req.user.id; 

    try {
        const [history] = await db.execute(
            `SELECT
                wh.id as historyId,
                wh.watchedAt,
                m.id AS movieId,
                m.title AS movieTitle,
                m.posterUrl AS moviePosterUrl,
                s.id AS seriesId,
                s.title AS seriesTitle,
                s.posterUrl AS seriesPosterUrl,
                e.id AS episodeId,
                e.title AS episodeTitle,
                e.episodeNumber AS episodeNumber,
                sea.seasonNumber AS seasonNumber
            FROM WatchHistory wh
            LEFT JOIN Movies m ON wh.movie_id = m.id
            LEFT JOIN Series s ON wh.series_id = s.id
            LEFT JOIN Episodes e ON wh.episode_id = e.id
            LEFT JOIN Seasons sea ON e.season_id = sea.id 
            WHERE wh.user_id = ?
            ORDER BY wh.watchedAt DESC`,
            [userId]
        );

        res.json(history);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique de visionnage:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.' });
    }
});

// Effacer une entrée spécifique de l'historique
router.delete('/watch-history/:historyId', authMiddleware, async (req, res) => {
    const { historyId } = req.params;
    const userId = req.user.id; 

    try {
        const [result] = await db.execute(
            'DELETE FROM WatchHistory WHERE id = ? AND user_id = ?',
            [historyId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Entrée d\'historique non trouvée ou non autorisée.' });
        }

        res.json({ message: 'Entrée d\'historique supprimée.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'entrée d\'historique:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'entrée d\'historique.' });
    }
});

module.exports = router;