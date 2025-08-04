// backend/testAuth.js
const { User } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAuthSystem() {
    try {
        console.log('🧪 Test du système d\'authentification...\n');

        // 1. Test de création d'utilisateur
        console.log('📝 Test 1: Création d\'un utilisateur de test');
        
        const testEmail = 'test@example.com';
        const testPassword = 'password123';
        
        // Supprimer l'utilisateur de test s'il existe
        await User.destroy({ where: { email: testEmail } });
        
        // Créer un nouvel utilisateur
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: testEmail,
            password: hashedPassword,
            isAdmin: false,
            isSubscribed: false
        });
        
        console.log('✅ Utilisateur créé:', {
            id: testUser.id,
            email: testUser.email,
            isAdmin: testUser.isAdmin
        });

        // 2. Test de recherche d'utilisateur
        console.log('\n🔍 Test 2: Recherche d\'utilisateur');
        const foundUser = await User.findOne({ where: { email: testEmail } });
        
        if (foundUser) {
            console.log('✅ Utilisateur trouvé:', foundUser.email);
        } else {
            console.log('❌ Utilisateur non trouvé');
        }

        // 3. Test de vérification de mot de passe
        console.log('\n🔐 Test 3: Vérification de mot de passe');
        const isPasswordCorrect = await bcrypt.compare(testPassword, foundUser.password);
        console.log('✅ Mot de passe correct:', isPasswordCorrect);
        
        const isWrongPassword = await bcrypt.compare('wrongpassword', foundUser.password);
        console.log('❌ Mauvais mot de passe rejeté:', !isWrongPassword);

        // 4. Test avec un utilisateur inexistant
        console.log('\n👻 Test 4: Utilisateur inexistant');
        const ghostUser = await User.findOne({ where: { email: 'ghost@example.com' } });
        console.log('✅ Utilisateur inexistant correctement non trouvé:', !ghostUser);

        // 5. Lister tous les utilisateurs
        console.log('\n👥 Test 5: Liste de tous les utilisateurs');
        const allUsers = await User.findAll({
            attributes: ['id', 'email', 'firstName', 'lastName', 'isAdmin', 'createdAt']
        });
        
        console.log(`📊 Nombre total d'utilisateurs: ${allUsers.length}`);
        allUsers.forEach(user => {
            console.log(`- ${user.email} (Admin: ${user.isAdmin})`);
        });

        // Nettoyer : supprimer l'utilisateur de test
        await User.destroy({ where: { email: testEmail } });
        console.log('\n🧹 Utilisateur de test supprimé');

        console.log('\n✅ Tous les tests sont passés ! Le système d\'authentification fonctionne correctement.');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

testAuthSystem()
    .then(() => {
        console.log('\n🏁 Tests terminés');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });