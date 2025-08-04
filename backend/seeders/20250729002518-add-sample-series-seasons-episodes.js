'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    // Insérer la série
    const [serieId] = await queryInterface.bulkInsert('Series', [{
      title: 'Les Chroniques du Temps',
      description: 'Une série épique sur le voyage dans le temps et ses conséquences.',
      genre: 'Science-fiction',
      posterUrl: 'https://via.placeholder.com/300x450/008000/FFFFFF?text=SerieTemps',
      isFeatured: true,
      createdAt: now,
      updatedAt: now
    }], { returning: ['id'] });

    // Saison 1
    const [season1Id] = await queryInterface.bulkInsert('Seasons', [{
      seriesId: serieId.id,
      seasonNumber: 1,
      title: 'La Genèse',
      posterUrl: 'https://via.placeholder.com/300x450/008000/FFFFFF?text=Saison1',
      createdAt: now,
      updatedAt: now
    }], { returning: ['id'] });

    await queryInterface.bulkInsert('Episodes', [
      {
        seasonId: season1Id.id,
        episodeNumber: 1,
        title: 'Le Point de Départ',
        description: 'Un scientifique excentrique invente une machine à voyager dans le temps.',
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        duration: 50,
        createdAt: now,
        updatedAt: now
      },
      {
        seasonId: season1Id.id,
        episodeNumber: 2,
        title: 'Premiers Pas',
        description: 'Le premier voyage dans le passé se passe mal, créant un paradoxe.',
        videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        duration: 45,
        createdAt: now,
        updatedAt: now
      }
    ]);

    // Saison 2
    const [season2Id] = await queryInterface.bulkInsert('Seasons', [{
      seriesId: serieId.id,
      seasonNumber: 2,
      title: 'Les Conséquences',
      posterUrl: 'https://via.placeholder.com/300x450/008000/FFFFFF?text=Saison2',
      createdAt: now,
      updatedAt: now
    }], { returning: ['id'] });

    await queryInterface.bulkInsert('Episodes', [{
      seasonId: season2Id.id,
      episodeNumber: 1,
      title: 'Un Futur Altéré',
      description: 'Les héros découvrent les changements majeurs de leur ligne temporelle.',
      videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      duration: 55,
      createdAt: now,
      updatedAt: now
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Episodes', null, {});
    await queryInterface.bulkDelete('Seasons', null, {});
    await queryInterface.bulkDelete('Series', null, {});
  }
};
