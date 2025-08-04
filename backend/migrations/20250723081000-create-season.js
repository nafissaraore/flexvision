// backend/migrations/YYYYMMDDHHMMSS-create-season.js
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seasons', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      seriesId: { // Clé étrangère vers la table Series
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Series', // Nom de la table cible
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      seasonNumber: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING },
      posterUrl: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    // Assurez-vous qu'une série ne peut pas avoir deux fois le même numéro de saison
    await queryInterface.addConstraint('Seasons', {
      fields: ['seriesId', 'seasonNumber'],
      type: 'unique',
      name: 'unique_series_season'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Seasons');
  }
};