// backend/fixPasswords.js
const { User } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixExistingPasswords() {
    try {
        console.log('🔧 Correction des mots de passe existants...');
        
        // Récupérer tous les utilisateurs
        const users = await User.findAll();
        console.log(`📊 ${users.length} utilisateurs trouvés`);

        for (const user of users) {
            // Vérifier si le mot de passe est déjà haché (commence par $2)
            if (!user.password.startsWith('$2')) {
                console.log(`🔐 Hachage du mot de passe pour: ${user.email}`);
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                // Mettre à jour SANS déclencher les hooks
                await User.update(
                    { password: hashedPassword },
                    { 
                        where: { id: user.id },
                        hooks: false // IMPORTANT: éviter les hooks pour éviter double hachage
                    }
                );
                console.log(`✅ Mot de passe mis à jour pour: ${user.email}`);
            } else {
                console.log(`✅ Mot de passe déjà haché pour: ${user.email}`);
            }
        }

        console.log('🎯 Correction terminée !');
        
        // Créer l'admin avec le bon mot de passe
        console.log('👑 Mise à jour de l\'admin...');
        const admin = await User.findOne({ where: { email: 'admin@flexvision.com' } });
        
        if (admin) {
            // Mettre à jour l'admin pour être sûr qu'il est admin ET que son mot de passe fonctionne
            await User.update(
                { 
                    isAdmin: true,
                    password: await bcrypt.hash('admin123', 10)
                },
                { 
                    where: { id: admin.id },
                    hooks: false
                }
            );
            console.log('✅ Admin mis à jour - Email: admin@flexvision.com, Password: admin123');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la correction:', error);
    }
}

fixExistingPasswords()
    .then(() => {
        console.log('🏁 Script terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });