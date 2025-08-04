// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Importe l'objet db contenant sequelize et tous les modèles

// Importez les routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const seriesRoutes = require('./routes/seriesRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test de la connexion à la base de données et synchronisation (pour le dev)
async function initDbAndServer() {
    try {
        await db.sequelize.authenticate();
        console.log('Connexion à MySQL réussie avec Sequelize !');

        // Synchronisation des modèles : crée les tables si elles n'existent pas.
        // Utilisez `alter: true` avec prudence en production, préférez les migrations.
        // await db.sequelize.sync({ alter: true });
        // console.log('Toutes les tables ont été synchronisées avec succès !');

        // Utilisation des routes
        app.use('/api/auth', authRoutes);
        app.use('/api/movies', movieRoutes);
        app.use('/api/series', seriesRoutes);
// server.js ou app.js
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/admin', require('./routes/adminRoutes'));

        app.get('/', (req, res) => {
            res.send('API FlexVision - Backend Node.js (MySQL) en cours d\'exécution !');
        });

        // Démarrez le serveur Node.js
        app.listen(port, () => {
            console.log(`Serveur FlexVision Backend démarré sur http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Erreur au démarrage du serveur ou de la DB :', error.message);
        process.exit(1); // Arrête l'application si la DB ne se connecte pas
    }
}

initDbAndServer();

// Exportez l'objet db (contenant sequelize et les modèles)
module.exports = db;