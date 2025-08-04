// backend/src/routes/watchHistoryRoutes.js

const express = require('express');
const router = express.Router();
const { db } = require('../database'); // Assurez-vous que votre instance de base de données est exportée et accessible
const authenticateToken = require('../middleware/auth'); // Middleware pour vérifier le JWT

// Route POST pour ajouter un film à l'historique de visionnage
router.post('/movie', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { movieId } = req.body;

    if (!movieId) {
        return res.status(400).json({ message: 'L\'ID du film est requis.' });
    }

    try {
        // Enregistrer l'entrée dans la base de données
        const query = 'INSERT INTO WatchHistory (userId, movieId, watchedAt) VALUES (?, ?, CURRENT_TIMESTAMP)';
        await db.run(query, [userId, movieId]);
        res.status(201).json({ message: 'Film ajouté à l\'historique.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du film à l\'historique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

// Route POST pour ajouter un épisode de série à l'historique de visionnage
router.post('/series/:seriesId/episode/:episodeId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { seriesId, episodeId } = req.params;

    try {
        // Enregistrer l'entrée dans la base de données
        const query = 'INSERT INTO WatchHistory (userId, seriesId, episodeId, watchedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)';
        await db.run(query, [userId, seriesId, episodeId]);
        res.status(201).json({ message: 'Épisode de série ajouté à l\'historique.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'épisode à l\'historique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

// Route GET pour récupérer l'historique de visionnage de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Cette requête complexe récupère les films et les épisodes de séries
        // en utilisant des JOIN pour obtenir tous les détails nécessaires.
        const query = `
            SELECT
                wh.id AS historyId,
                wh.watchedAt,
                m.id AS movieId,
                m.title AS movieTitle,
                m.posterUrl AS moviePosterUrl,
                s.id AS seriesId,
                s.title AS seriesTitle,
                s.posterUrl AS seriesPosterUrl,
                ep.id AS episodeId,
                ep.title AS episodeTitle,
                ep.episodeNumber,
                se.seasonNumber
            FROM WatchHistory wh
            LEFT JOIN Movies m ON wh.movieId = m.id
            LEFT JOIN Series s ON wh.seriesId = s.id
            LEFT JOIN Episodes ep ON wh.episodeId = ep.id
            LEFT JOIN Seasons se ON ep.seasonId = se.id
            WHERE wh.userId = ?
            ORDER BY wh.watchedAt DESC
        `;
        const history = await db.all(query, [userId]);
        res.status(200).json(history);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

// Route DELETE pour supprimer une entrée de l'historique
router.delete('/:historyId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { historyId } = req.params;

    try {
        // S'assurer que l'utilisateur ne peut supprimer que ses propres entrées
        const query = 'DELETE FROM WatchHistory WHERE id = ? AND userId = ?';
        const result = await db.run(query, [historyId, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Entrée non trouvée ou non autorisée.' });
        }

        res.status(200).json({ message: 'Entrée supprimée de l\'historique.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'entrée:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

module.exports = router;
