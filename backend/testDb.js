// backend/testDb.js
const { sequelize, User } = require('./models');

async function testDatabase() {
    try {
        console.log('🔄 Test de connexion à la base de données...');
        
        // Test de connexion
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données réussie.');
        
        // Test de synchronisation des modèles
        await sequelize.sync();
        console.log('✅ Synchronisation des modèles réussie.');
        
        // Test de création d'un utilisateur de test
        console.log('🔄 Test de création d\'utilisateur...');
        
        // Supprimer l'utilisateur de test s'il existe
        await User.destroy({ where: { email: 'test@example.com' } });
        
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'testpassword123',
            isAdmin: false,
            isSubscribed: false
        });
        
        console.log('✅ Utilisateur de test créé:', {
            id: testUser.id,
            email: testUser.email,
            firstName: testUser.firstName,
            hashedPassword: testUser.password.substring(0, 20) + '...'
        });
        
        // Test de recherche
        const foundUser = await User.findOne({ where: { email: 'test@example.com' } });
        console.log('✅ Utilisateur trouvé:', foundUser ? foundUser.email : 'Non trouvé');
        
        // Test de comparaison de mot de passe
        if (foundUser) {
            const isMatch = await foundUser.comparePassword('testpassword123');
            console.log('✅ Test de comparaison de mot de passe:', isMatch ? 'SUCCÈS' : 'ÉCHEC');
            
            const isWrongMatch = await foundUser.comparePassword('wrongpassword');
            console.log('✅ Test avec mauvais mot de passe:', isWrongMatch ? 'ÉCHEC (problème)' : 'SUCCÈS');
        }
        
        // Nettoyer
        await User.destroy({ where: { email: 'test@example.com' } });
        console.log('✅ Utilisateur de test supprimé.');
        
        // Lister tous les utilisateurs
        const allUsers = await User.findAll();
        console.log(`📊 Nombre total d'utilisateurs dans la DB: ${allUsers.length}`);
        
        allUsers.forEach(user => {
            console.log(`   - ${user.email} (ID: ${user.id}, Admin: ${user.isAdmin})`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        console.error('Type d\'erreur:', error.name);
        console.error('Message:', error.message);
        
        if (error.name === 'SequelizeConnectionError') {
            console.error('🔍 Vérifiez:');
            console.error('   - MySQL est-il démarré ?');
            console.error('   - La base de données "flexvision_db" existe-t-elle ?');
            console.error('   - Les identifiants dans config.json sont-ils corrects ?');
        }
    } finally {
        await sequelize.close();
        console.log('🔒 Connexion fermée.');
    }
}

// Exécuter le test
testDatabase();