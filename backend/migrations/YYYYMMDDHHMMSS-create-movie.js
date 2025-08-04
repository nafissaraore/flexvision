// backend/migrations/YYYYMMDDHHMMSS-create-movie.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Movies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      releaseYear: {
        type: Sequelize.INTEGER
      },
      duration: { // Durée en minutes
        type: Sequelize.INTEGER
      },
      genre: {
        type: Sequelize.STRING
      },
      director: {
        type: Sequelize.STRING
      },
      cast: {
        type: Sequelize.STRING // Peut être une liste d'acteurs séparée par des virgules
      },
      posterUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      trailerUrl: {
        type: Sequelize.STRING
      },
      videoUrl: { // URL du fichier vidéo hébergé sur un CDN (ex: Cloudflare Stream, AWS S3)
        type: Sequelize.STRING,
        allowNull: false
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Movies');
  }
};