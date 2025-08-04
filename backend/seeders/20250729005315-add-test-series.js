'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("Tentative d'insertion d'une série de test...");

    const now = new Date();

    try {
      // Étape 1 : Insertion sans retour direct
      await queryInterface.bulkInsert('Series', [{
        title: 'Titre de Série de Test',
        description: 'Ceci est une description de test pour la série.',
        genre: 'Fiction',
        posterUrl: 'http://example.com/poster.jpg',
        isFeatured: false,
        createdAt: now,
        updatedAt: now,
      }]);

      // Étape 2 : Récupération de la série insérée (compatible MySQL)
      const [results, metadata] = await queryInterface.sequelize.query(
        `SELECT id FROM Series WHERE title = 'Titre de Série de Test' LIMIT 1;`
      );

      const series = results[0];

      if (!series || !series.id) {
        console.error("Échec de l'insertion de la série de test: Aucun ID trouvé après SELECT.");
        throw new Error("L'insertion de la série de test a échoué.");
      }

      console.log(`✅ Série de test insérée avec succès, ID: ${series.id}`);

    } catch (error) {
      console.error("❌ Erreur détaillée lors de bulkInsert de la série de test:", error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Annulation de la série de test...");
    await queryInterface.bulkDelete('Series', { title: 'Titre de Série de Test' }, {});
  }
};
