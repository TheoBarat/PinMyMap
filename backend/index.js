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
  const { userId, countryCode, countryName, state, description, color } = req.body;

  try {
    // Vérifiez que 'state' est fourni
    if (!state) {
      return res.status(400).json({ message: "Le champ 'state' est requis." });
    }

    // Convertissez 'state' en 'status' pour correspondre au modèle Prisma
    const status = state;

    let country = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!country) {
      country = await prisma.country.create({
        data: { code: countryCode, name: countryName || countryCode },
      });
    }

    if (status === "not_selected") {
      await prisma.visit.deleteMany({
        where: {
          userId: parseInt(userId),
          countryId: country.id,
        },
      });
      return res.json({ message: "Visite supprimée avec succès" });
    }

    const visit = await prisma.visit.upsert({
      where: {
        userId_countryId: {
          userId: parseInt(userId),
          countryId: country.id,
        },
      },
      update: { status, description: description || "", color: color || "transparent" },
      create: { userId: parseInt(userId), countryId: country.id, status, description: description || "", color: color || "transparent" },
    });

    res.json({ message: 'Visite mise à jour avec succès', visit });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du pays :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du pays', details: error.message });
  }
});


// Endpoint : Les pays les plus visités
app.get('/api/most-visited', async (req, res) => {
  try {
    const mostVisited = await prisma.country.findMany({
      include: {
        visits: {
          where: { status: 'visited' },
        },
      },
      orderBy: {
        visits: {
          _count: 'desc',
        },
      },
      take: 10, // Limiter aux 10 pays les plus visités
    });

    const result = mostVisited.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
      visitsCount: country.visits.length,
    }))
    .sort((a, b) => b.visitsCount - a.visitsCount); // Tri décroissant par nombre de visites

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des pays les plus visités:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des pays les plus visités' });
  }
});

// Endpoint : Les pays les mieux notés (exemple basé sur une note fictive)
app.get("/api/top-rated", async (req, res) => {
  try {
    const topRated = await prisma.country.findMany({
      orderBy: { population: "desc" }, // Exemple : classez par population
      take: 10,
    });

    const response = topRated.map((country) => ({
      id: country.id,
      name: country.name,
      rating: Math.random() * 5, // Exemple d'une note aléatoire
    }))
    .sort((a, b) => b.rating - a.rating); // Tri décroissant par note

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Endpoint : Les pays les plus demandés
app.get("/api/demanded", async (req, res) => {
  try {
    const demanded = await prisma.country.findMany({
      include: {
        visits: {
          where: { status: "to_visit" },
        },
      },
      orderBy: {
        visits: { _count: "desc" },
      },
      take: 10,
    });

    const response = demanded.map((country) => ({
      id: country.id,
      name: country.name,
      visitRequests: country.visits.length,
    }))
    .sort((a, b) => b.visitRequests - a.visitRequests);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Endpoint : Détails d'un pays
app.get("/api/pays/:id/details", async (req, res) => {
  const countryId = parseInt(req.params.id);
  try {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      include: {
        visits: {
          include: {
            user: true, // Inclure les informations sur les utilisateurs associés aux visites
          },
        },
      },
    });

    if (!country) {
      return res.status(404).json({ error: "Pays introuvable." });
    }

    const visitedCount = country.visits.filter((v) => v.status === "visited").length;
    const wishlistCount = country.visits.filter((v) => v.status === "wishlist").length;

    // Filtrer les visites avec des descriptions (utilisées comme commentaires)
    const comments = country.visits
      .filter((v) => v.description) // Garde uniquement les visites avec une description
      .map((visit) => ({
        user: {
          id: visit.user.id,
          email: visit.user.email,
        },
        description: visit.description,
        status: visit.status,
      }));

    res.status(200).json({
      id: country.id,
      name: country.name,
      visitsCount: visitedCount,
      visitRequests: wishlistCount,
      comments: comments,
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

/**
 * Lancement du serveur
 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
});