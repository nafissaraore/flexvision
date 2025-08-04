// createAdmin.js - À placer dans le dossier backend
const bcrypt = require('bcryptjs');
const { User } = require('./models'); // Ajustez le chemin selon votre structure
require('dotenv').config();

async function createAdminUser() {
    try {
        // Vérifier si un admin existe déjà
        const existingAdmin = await User.findOne({ where: { isAdmin: true } });
        
        if (existingAdmin) {
            console.log('✅ Un utilisateur admin existe déjà:', existingAdmin.email);
            return;
        }

        // Données de l'admin
        const adminData = {
            firstName: 'Admin',
            lastName: 'FlexVision',
            email: 'admin@flexvision.com',
            password: 'admin123', // Changez ce mot de passe !
            isAdmin: true,
            isSubscribed: true
        };

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Créer l'utilisateur admin
        const admin = await User.create({
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            email: adminData.email,
            password: hashedPassword,
            isAdmin: adminData.isAdmin,
            isSubscribed: adminData.isSubscribed
        });

        console.log('✅ Utilisateur admin créé avec succès !');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Mot de passe:', adminData.password);
        console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error);
    }
}

// Exécuter le script
createAdminUser()
    .then(() => {
        console.log('Script terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erreur fatale:', error);
        process.exit(1);
    });