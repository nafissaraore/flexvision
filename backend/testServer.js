// backend/testServer.js
const express = require('express');
const cors = require('cors');
const { User } = require('./models'); // Utilisez vos modèles existants

const app = express();
const PORT = 5001; // Port différent pour éviter les conflits

// Middlewares
app.use(cors());
app.use(express.json());

// Logs pour toutes les requêtes
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Route de test basique
app.get('/', (req, res) => {
    res.json({ message: 'Serveur de test FlexVision - OK!' });
});

// Route d'inscription de test
app.post('/api/auth/signup', async (req, res) => {
    console.log('🚨 SIGNUP TEST APPELÉ !');
    console.log('📨 Body reçu:', req.body);
    
    try {
        const { firstName, lastName, email, password } = req.body;
        
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        // Vérifier si l'utilisateur existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
        }

        // Créer l'utilisateur
        console.log('🔄 Création utilisateur...');
        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // Sera haché par le hook du modèle
            isAdmin: false,
            isSubscribed: false
        });

        console.log('✅ Utilisateur créé:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName
        });

        res.status(201).json({
            message: 'Inscription réussie !',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de l\'inscription.',
            error: error.message 
        });
    }
});

// Route de connexion de test
app.post('/api/auth/signin', async (req, res) => {
    console.log('🚨 SIGNIN TEST APPELÉ !');
    console.log('📨 Body reçu:', req.body);
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        // Rechercher l'utilisateur
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', email);
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        console.log('✅ Utilisateur trouvé:', user.email);

        // Tester le mot de passe
        const isMatch = await user.comparePassword(password);
        console.log('🔐 Résultat comparaison:', isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        console.log('✅ Connexion réussie pour:', user.email);

        res.status(200).json({
            message: 'Connexion réussie !',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });

    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        res.status(500).json({ 
            message: 'Erreur serveur lors de la connexion.',
            error: error.message 
        });
    }
});

// Route pour lister les utilisateurs
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'isAdmin', 'createdAt']
        });
        
        console.log(`📊 ${users.length} utilisateurs trouvés`);
        res.json(users);
    } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Démarrer le serveur de test
app.listen(PORT, () => {
    console.log(`🧪 Serveur de test démarré sur http://localhost:${PORT}`);
    console.log('📋 Routes disponibles:');
    console.log('  GET  / - Test de base');
    console.log('  POST /api/auth/signup - Inscription');
    console.log('  POST /api/auth/signin - Connexion');
    console.log('  GET  /api/users - Liste des utilisateurs');
    console.log('\n🔧 Pour tester:');
    console.log(`  1. Allez à http://localhost:${PORT} dans votre navigateur`);
    console.log(`  2. Modifiez temporairement votre frontend pour utiliser le port ${PORT}`);
    console.log(`  3. Ou utilisez le script de test avec le nouveau port`);
});