// backend/migrations/xxxxxx-create-user-favorite.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserFavorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Nom de la table réelle des utilisateurs
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      movieId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Peut être null si c'est une série
        references: {
          model: 'Movies', // Nom de la table réelle des films
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seriesId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Peut être null si c'est un film
        references: {
          model: 'Series', // Nom de la table réelle des séries
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Ces contraintes sont spécifiques à UserFavorites et sont correctement nommées
    await queryInterface.addConstraint('UserFavorites', {
      fields: ['userId', 'movieId'],
      type: 'unique',
      name: 'unique_user_movie_favorite', // Nom correct pour cette contrainte
      where: {
        movieId: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await queryInterface.addConstraint('UserFavorites', {
      fields: ['userId', 'seriesId'],
      type: 'unique',
      name: 'unique_user_series_favorite', // Nom correct pour cette contrainte
      where: {
        seriesId: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserFavorites');
  }
};