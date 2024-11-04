const express = require('express');
const cors = require('cors'); // Importer le module cors
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Utiliser CORS pour autoriser les requêtes depuis le front-end
app.use(cors());

app.use(express.json());

// Endpoint pour récupérer les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});