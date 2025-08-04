// backend/migrations/YYYYMMDDHHMMSS-create-episode.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Episodes', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      seasonId: { // Clé étrangère vers la table Seasons
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Seasons', // Nom de la table cible
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      episodeNumber: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      videoUrl: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.INTEGER },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    // Assurez-vous qu'une saison ne peut pas avoir deux fois le même numéro d'épisode
    await queryInterface.addConstraint('Episodes', {
      fields: ['seasonId', 'episodeNumber'],
      type: 'unique',
      name: 'unique_season_episode'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Episodes');
  }
};