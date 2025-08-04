const express = require('express');
const router = express.Router();

// Exemple de route GET pour récupérer les favoris
router.get('/', (req, res) => {
  // Logique pour récupérer les favoris
  res.json([{ id: 1, title: "Ma série favorite" }]);
});

module.exports = router;
