const express = require('express');
const router = express.Router();
// const authController = require('../controllers/authController'); // Commenté temporairement

// Test avec des fonctions simples
router.post('/signup', (req, res) => {
    res.json({ message: 'Route signup OK' });
});

router.post('/signin', (req, res) => {
    res.json({ message: 'Route signin OK' });
});

module.exports = router;