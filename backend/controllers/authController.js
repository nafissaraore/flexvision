// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Contrôleur pour l'inscription (signup)
exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        console.log('🔄 Tentative d\'inscription pour:', email);

        if (!firstName || !lastName || !email || !password) {
            console.log('❌ Champs manquants');
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        console.log('🔍 Vérification de l\'existence de l\'utilisateur...');
        const existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            console.log('❌ Utilisateur existe déjà:', email);
            return res.status(400).json({ message: 'Cet email est déjà enregistré.' });
        }

        console.log('✅ Email disponible, création de l\'utilisateur...');

        // IMPORTANT: Laissez le modèle User hacher le mot de passe avec ses hooks
        // Ne pas hacher manuellement ici !
        const user = await User.create({
            firstName,
            lastName,
            email,
            password, // Mot de passe en clair, le hook va le hacher
            isAdmin: false,
            isSubscribed: false
        });

        console.log('✅ Utilisateur créé avec succès:', {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        });

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Token généré pour inscription');

        res.status(201).json({
            message: 'Inscription réussie !',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.isAdmin ? 'admin' : 'user',
                isAdmin: user.isAdmin,
                isSubscribed: user.isSubscribed,
            },
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'inscription:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Données invalides: ' + error.errors[0].message });
        }
        
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Erreur de connexion à la base de données.' });
        }

        res.status(500).json({ 
            message: 'Erreur serveur lors de l\'inscription.', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

// Contrôleur pour la connexion (signin)
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('🔄 Tentative de connexion pour:', email);

        if (!email || !password) {
            console.log('❌ Email ou mot de passe manquant');
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        console.log('🔍 Recherche de l\'utilisateur dans la base de données...');
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('❌ Utilisateur non trouvé dans la BDD:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        console.log('✅ Utilisateur trouvé:', {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
        });

        // Utiliser la méthode comparePassword du modèle ou bcrypt.compare
        console.log('🔍 Vérification du mot de passe...');
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log('❌ Mot de passe incorrect pour:', email);
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        console.log('✅ Mot de passe correct, connexion autorisée');

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Token généré pour connexion');

        res.status(200).json({
            message: 'Connexion réussie !',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.isAdmin ? 'admin' : 'user',
                isAdmin: user.isAdmin,
                isSubscribed: user.isSubscribed,
            },
        });

    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({ message: 'Erreur de connexion à la base de données.' });
        }

        res.status(500).json({ 
            message: 'Erreur serveur lors de la connexion.', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

// Middleware pour vérifier le token JWT
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('🔍 Vérification du token:', token ? 'Token présent' : 'Token manquant');

        if (!token) {
            return res.status(401).json({ message: 'Token d\'accès requis.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token valide pour utilisateur:', decoded.email);
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Erreur de vérification du token:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token invalide.' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré.' });
        }
        
        res.status(401).json({ message: 'Erreur d\'authentification.' });
    }
};

// Middleware pour vérifier les droits admin
exports.requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user || !user.isAdmin) {
            console.log('❌ Accès admin refusé pour:', req.user.email);
            return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
        }
        
        console.log('✅ Accès admin accordé pour:', req.user.email);
        next();
    } catch (error) {
        console.error('❌ Erreur lors de la vérification admin:', error);
        res.status(500).json({ message: 'Erreur de vérification des droits.' });
    }
};

exports.logout = (req, res) => {
    console.log('🔄 Déconnexion demandée');
    res.status(200).json({ message: 'Déconnexion réussie.' });
};