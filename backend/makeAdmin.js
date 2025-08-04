// makeAdmin.js - Placez ce fichier dans votre dossier backend
require('dotenv').config();
const db = require('./models');

async function makeAdmin() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connexion DB réussie');

    // CHANGEZ CET EMAIL par le vôtre
    const EMAIL_TO_PROMOTE = 'votre@email.com';

    const user = await db.User.findOne({ 
      where: { email: EMAIL_TO_PROMOTE } 
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', EMAIL_TO_PROMOTE);
      console.log('💡 Créez d\'abord un compte avec cet email sur votre app');
    } else {
      await user.update({ isAdmin: true });
      console.log('🎉 Utilisateur promu admin:', user.email);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit();
  }
}

makeAdmin();