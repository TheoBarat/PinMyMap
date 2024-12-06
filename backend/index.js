const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'http://localhost:8080' }));
// Utiliser CORS pour autoriser les requêtes depuis le front-end
app.use(cors());

// Middleware pour analyser le corps des requêtes JSON
app.use(express.json());

// Middleware pour valider les données de création d'utilisateur
const validateUserCreation = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  next();
};

// Endpoint pour récupérer les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Endpoint pour créer un utilisateur
app.post('/users', validateUserCreation, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash du mot de passe
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error('Erreur lors de la création de l’utilisateur', error);
    res.status(500).json({ error: 'Erreur lors de la création de l’utilisateur' });
  }
});

// Endpoint pour le login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Vérification des credentials
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Génération du token JWT
    const token = jwt.sign({ email: user.email }, "your-secret-key", { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error('Erreur lors du login', error);
    res.status(500).json({ error: 'Erreur lors du login' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});
