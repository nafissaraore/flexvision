// backend/controllers/seriesController.js

// Assurez-vous que l'importation de db est correcte et qu'il charge tous les modèles
const db = require('../models');
const Series = db.Series;
const Season = db.Season;
const Episode = db.Episode;

// Récupérer toutes les séries (avec options de recherche/filtre)
exports.getAllSeries = async (req, res) => {
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

    const series = await Series.findAll({
      where: whereClause, // Applique les conditions de recherche
      include: [
        {
          model: Season,
          as: 'seasons',
          include: [
            {
              model: Episode,
              as: 'episodes',
              attributes: ['id', 'title', 'episodeNumber', 'duration', 'videoUrl', 'description']
            }
          ]
        }
      ],
      // Correction de l'ordre pour les associations imbriquées
      order: [
        ['title', 'ASC'], // Tri principal par titre de la série
        [{ model: Season, as: 'seasons' }, 'seasonNumber', 'ASC'], // Puis par numéro de saison
        [{ model: Season, as: 'seasons' }, { model: Episode, as: 'episodes' }, 'episodeNumber', 'ASC'] // Puis par numéro d'épisode
      ]
    });
    res.status(200).json(series);
  } catch (error) {
    console.error('Erreur lors de la récupération des séries:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des séries.', error: error.message });
  }
};

// Récupérer une série par ID avec ses saisons et épisodes
exports.getSeriesById = async (req, res) => {
  try {
    const series = await Series.findByPk(req.params.id, {
      include: [
        {
          model: Season,
          as: 'seasons',
          include: [
            {
              model: Episode,
              as: 'episodes',
              attributes: ['id', 'title', 'episodeNumber', 'duration', 'videoUrl', 'description']
            }
          ]
        }
      ],
      // Correction de l'ordre pour les associations imbriquées
      order: [
        [{ model: Season, as: 'seasons' }, 'seasonNumber', 'ASC'],
        [{ model: Season, as: 'seasons' }, { model: Episode, as: 'episodes' }, 'episodeNumber', 'ASC']
      ]
    });
    if (!series) {
      return res.status(404).json({ message: 'Série non trouvée.' });
    }
    res.status(200).json(series);
  } catch (error) {
    console.error('Erreur lors de la récupération de la série:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la série.', error: error.message });
  }
};

// Récupérer toutes les saisons d'une série spécifique
exports.getSeasonsBySeriesId = async (req, res) => {
  try {
    const seriesId = req.params.seriesId;
    const seasons = await Season.findAll({
      where: { seriesId: seriesId },
      include: [{
        model: Episode,
        as: 'episodes',
        attributes: ['id', 'title', 'episodeNumber', 'duration', 'videoUrl', 'description']
      }],
      order: [
        ['seasonNumber', 'ASC'],
        [{ model: Episode, as: 'episodes' }, 'episodeNumber', 'ASC'] // Ordre des épisodes au sein de la saison
      ]
    });
    if (!seasons || seasons.length === 0) {
      return res.status(404).json({ message: 'Saisons non trouvées pour cette série.' });
    }
    res.status(200).json(seasons);
  } catch (error) {
    console.error('Erreur lors de la récupération des saisons par ID de série:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des saisons.', error: error.message });
  }
};

// Récupérer tous les épisodes d'une saison spécifique
exports.getEpisodesBySeasonId = async (req, res) => {
  try {
    const seasonId = req.params.seasonId;
    const episodes = await Episode.findAll({
      where: { seasonId: seasonId },
      order: [['episodeNumber', 'ASC']]
    });
    if (!episodes || episodes.length === 0) {
      return res.status(404).json({ message: 'Épisodes non trouvés pour cette saison.' });
    }
    res.status(200).json(episodes);
  } catch (error) {
    console.error('Erreur lors de la récupération des épisodes par ID de saison:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des épisodes.', error: error.message });
  }
};

// Récupérer un épisode par ID
exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) {
      return res.status(404).json({ message: 'Épisode non trouvé.' });
    }
    res.status(200).json(episode);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'épisode par ID:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération de l\'épisode.', error: error.message });
  }
};

// --- Fonctions CRUD pour l'ADMIN ---
exports.createSeries = async (req, res) => {
  try {
    const newSeries = await Series.create(req.body);
    res.status(201).json({ message: 'Série créée avec succès', series: newSeries });
  } catch (error) {
    console.error('Erreur lors de la création de la série:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la série.', error: error.message });
  }
};

exports.createSeason = async (req, res) => {
  try {
    const newSeason = await Season.create(req.body);
    res.status(201).json({ message: 'Saison créée avec succès', season: newSeason });
  } catch (error) {
    console.error('Erreur lors de la création de la saison:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la saison.', error: error.message });
  }
};

exports.createEpisode = async (req, res) => {
  try {
    const newEpisode = await Episode.create(req.body);
    res.status(201).json({ message: 'Épisode créé avec succès', episode: newEpisode });
  } catch (error) {
    console.error('Erreur lors de la création de l\'épisode:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'épisode.', error: error.message });
  }
};

exports.updateSeries = async (req, res) => {
  try {
    const [updated] = await Series.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedSeries = await Series.findByPk(req.params.id);
      return res.status(200).json({ message: 'Série mise à jour avec succès', series: updatedSeries });
    }
    throw new Error('Série non trouvée.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la série:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la série.', error: error.message });
  }
};

exports.deleteSeries = async (req, res) => {
  try {
    const deleted = await Series.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).json({ message: 'Série supprimée avec succès' });
    }
    throw new Error('Série non trouvée.');
  } catch (error) {
    console.error('Erreur lors de la suppression de la série:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la série.', error: error.message });
  }
};
