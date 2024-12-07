const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const prisma = new PrismaClient();

/**
 * Configuration et middlewares
 */
app.use(cors({
  origin: 'http://localhost:5173', // URL du frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

/**
 * Middlewares personnalisés
 */
const validateUserCreation = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  next();
};

/**
 * Routes pour les utilisateurs
 */

// Récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Créer un utilisateur
app.post('/users', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 8);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName },
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "User already exists" });
  }
});


// Login utilisateur
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName, // Ajouter le prénom
        lastName: user.lastName,   // Ajouter le nom
      },
      "your-secret-key",
      { expiresIn: "1h" }
    );
    

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error('Erreur lors du login', error);
    res.status(500).json({ error: 'Erreur lors du login' });
  }
});

/**
 * Routes pour les pays et visites
 */

// Récupérer les visites d’un utilisateur
app.get('/api/countries/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const visits = await prisma.visit.findMany({
      where: { userId: parseInt(userId) },
      include: { country: true },
    });

    const data = visits.map((visit) => ({
      countryCode: visit.country.code,
      countryName: visit.country.name,
      state: visit.status,
      description: visit.description,
      color: visit.color,
    }));

    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des pays' });
  }
});

app.get("/me", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, "your-secret-key"); // Vérifie le token
    const { firstName, lastName, email } = decoded;

    res.json({ firstName, lastName, email });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


// Ajouter ou mettre à jour une visite
app.post('/api/countries/update', async (req, res) => {
  const { userId, countryCode, state, description, color } = req.body;

  // Renomme `state` en `status` pour correspondre au modèle Prisma
  const status = state;

  try {
    console.log("Requête reçue :", { userId, countryCode, status, description, color });

    let country = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!country) {
      country = await prisma.country.create({
        data: { code: countryCode, name: countryCode },
      });
    }

    const visit = await prisma.visit.upsert({
      where: {
        userId_countryId: {
          userId: parseInt(userId),
          countryId: country.id,
        },
      },
      update: { status, description, color },
      create: { userId: parseInt(userId), countryId: country.id, status, description, color },
    });

    res.json({ message: 'Visite mise à jour avec succès', visit });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du pays :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du pays', details: error.message });
  }
});

/**
 * Lancement du serveur
 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});