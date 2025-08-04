// backend/seeders/YYYYMMDDHHMMSS-add-sample-movies.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Movies', [{
      title: 'L\'aventure fantastique',
      description: 'Un groupe d\'amis découvre un monde magique et doit le sauver.',
      releaseYear: 2023,
      duration: 120,
      genre: 'Aventure',
      director: 'Alice Dupont',
      cast: 'Bob Martin, Carla Gomez',
      posterUrl: 'https://via.placeholder.com/300x450/FF0000/FFFFFF?text=AventureFilm', // URL d'image placeholder
      trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Exemple de trailer YouTube
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // URL de vidéo de test
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Le mystère de la cité perdue',
      description: 'Une archéologue découvre les secrets d\'une ancienne civilisation.',
      releaseYear: 2022,
      duration: 95,
      genre: 'Mystère',
      director: 'David Leclerc',
      cast: 'Emma Watson, Tom Hanks',
      posterUrl: 'https://via.placeholder.com/300x450/0000FF/FFFFFF?text=MystereFilm',
      trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Movies', null, {});
  }
};