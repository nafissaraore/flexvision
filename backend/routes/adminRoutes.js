const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const subscriptionController = require('../controllers/subscriptionController');
const statsController = require('../controllers/statsController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Debug middleware (à supprimer après résolution du problème)
router.use((req, res, next) => {
  console.log(`🔍 Route admin appelée: ${req.method} ${req.originalUrl}`);
  console.log(`🔍 Headers d'autorisation: ${req.headers.authorization ? 'Présent' : 'Absent'}`);
  next();
});

// CORRECTION: Appliquer d'abord authMiddleware puis isAdmin
router.use(authMiddleware);
router.use(isAdmin);

// Routes de gestion des utilisateurs
router.get('/users', (req, res, next) => {
  console.log('✅ Route /users atteinte');
  next();
}, userController.getAllUsers);

router.put('/users/:id', userController.updateUserRole);
router.delete('/users/:id', userController.deleteUser);

// Routes de gestion des abonnements
router.get('/subscriptions', subscriptionController.getAllSubscriptions);
router.post('/subscriptions/:id/cancel', subscriptionController.cancelSubscription);

// Routes de statistiques
router.get('/stats', statsController.getPlatformStats);

module.exports = router;