// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// Middleware principal pour vérifier l'authenticité du token JWT
const authMiddleware = async (req, res, next) => {
  console.log('🔍 authMiddleware: Début de l\'authentification');
  
  const authHeader = req.headers.authorization;
  console.log('🔍 authMiddleware: Header Authorization:', authHeader ? 'Présent' : 'Absent');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ authMiddleware: Header manquant ou mal formaté');
    return res.status(401).json({ message: 'Authentification requise : Jeton manquant ou mal formaté.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔍 authMiddleware: Token extrait (premiers chars):', token.substring(0, 20) + '...');

  try {
    // Vérifiez le token
    console.log('🔍 authMiddleware: Vérification du token...');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 authMiddleware: Token décodé:', {
      id: decodedToken.id,
      exp: new Date(decodedToken.exp * 1000)
    });
    
    // Récupérez l'utilisateur et assurez-vous qu'il est bien dans la base de données
    console.log('🔍 authMiddleware: Recherche utilisateur avec ID:', decodedToken.id);
    const user = await User.findByPk(decodedToken.id, {
      attributes: ['id', 'isAdmin', 'email'] // Ajout temporaire de l'email pour debug
    });

    if (!user) {
      console.log('❌ authMiddleware: Utilisateur non trouvé dans la DB');
      return res.status(401).json({ message: 'Authentification échouée : Utilisateur non trouvé.' });
    }

    console.log('✅ authMiddleware: Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    req.user = user; // Attachez l'objet utilisateur à la requête
    console.log('✅ authMiddleware: Authentification réussie');
    next(); // Passe au prochain middleware/contrôleur
  } catch (error) {
    console.log('❌ authMiddleware: Erreur lors de la vérification:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ authMiddleware: Token expiré');
      return res.status(401).json({ message: 'Authentification échouée : Jeton expiré.' });
    }
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ authMiddleware: Token invalide');
      return res.status(401).json({ message: 'Authentification échouée : Jeton invalide.' });
    }
    console.error('❌ authMiddleware: Erreur d\'authentification:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'authentification.' });
  }
};

// Nouveau middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  console.log('🔍 isAdmin: Vérification des droits admin');
  console.log('🔍 isAdmin: req.user:', req.user ? {
    id: req.user.id,
    isAdmin: req.user.isAdmin
  } : 'null');

  if (req.user && req.user.isAdmin) {
    console.log('✅ isAdmin: Utilisateur est admin, accès autorisé');
    next(); // L'utilisateur est un admin, on continue
  } else {
    console.log('❌ isAdmin: Accès refusé - utilisateur pas admin');
    res.status(403).json({ message: 'Accès refusé. Vous devez être un administrateur.' });
  }
};

// Exportez les deux middlewares
module.exports = {
  authMiddleware,
  isAdmin
};