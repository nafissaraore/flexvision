// backend/migrations/YYYYMMDDHHMMSS-create-user.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false, // L'email ne peut pas être nul
        unique: true      // L'email doit être unique
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false // Le mot de passe ne peut pas être nul
      },
      isSubscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false // Par défaut, un nouvel utilisateur n'est pas abonné
      },
      subscriptionEndDate: {
        type: Sequelize.DATE,
        allowNull: true // Peut être nul si non abonné
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Valeur par défaut actuelle
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Valeur par défaut actuelle
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};