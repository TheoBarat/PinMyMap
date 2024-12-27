const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require("multer");
const path = require("path");

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

// Configuration de multer avec extension de fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Récupérer les informations de l'utilisateur connecté
app.get('/api/account', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, "your-secret-key");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des informations utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// Mettre à jour les informations utilisateur
app.put('/api/account', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const userId = decoded.id;

    const { email, password, firstName, lastName } = req.body;

    // Préparer les mises à jour
    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = bcrypt.hashSync(password, 8); // Hacher le mot de passe
    if (firstName) updates.firstName = firstName.trim();
    if (lastName) updates.lastName = lastName.trim();

    console.log("Champs à mettre à jour :", updates); // Log pour vérifier les données reçues

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Aucun champ à mettre à jour." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    res.status(200).json({ message: "Mise à jour effectuée avec succès.", user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});



// Supprimer le compte utilisateur
app.delete('/api/account', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const userId = decoded.id;

    // Supprimez les données associées à l'utilisateur
    await prisma.photo.deleteMany({
      where: { visit: { userId } },
    });
    await prisma.visit.deleteMany({
      where: { userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "Compte supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});




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
        firstName: user.firstName, 
        lastName: user.lastName,   
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
      include: {
        country: true, 
        photos: true,  
      },
    });

    const data = visits.map((visit) => ({
      countryCode: visit.country.code,
      countryName: visit.country.name,
      state: visit.status,
      description: visit.description,
      color: visit.color,
      score: visit.score,
      photos: visit.photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
      })), 
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

// Ajouter ou mettre à jour une visite avec photos
app.post('/api/countries/update', upload.array("photos"), async (req, res) => {
  const { userId, countryCode, countryName, state, description, color, score } = req.body;
  const files = req.files; // Les fichiers photos envoyés via le formulaire

  try {
    // Vérifiez que 'state' est fourni
    if (!state) {
      return res.status(400).json({ message: "Le champ 'state' est requis." });
    }

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

      // Supprimer les photos associées à la visite supprimée
      await prisma.photo.deleteMany({
        where: {
          visit: {
            userId: parseInt(userId),
            countryId: country.id,
          },
        },
      });

      return res.json({ message: "Visite supprimée avec succès" });
    }

    // Convertir 'score' en Float avant de l'utiliser
    const parsedScore = score ? parseFloat(score) : 0;

    const visit = await prisma.visit.upsert({
      where: {
        userId_countryId: {
          userId: parseInt(userId),
          countryId: country.id,
        },
      },
      update: { status, description: description || "", color: color || "transparent", score: parsedScore },
      create: { userId: parseInt(userId), countryId: country.id, status, description: description || "", color: color || "transparent", score: parsedScore },
    });

    // Ajouter les photos si des fichiers sont envoyés
    if (files && files.length > 0) {
      const photoEntries = files.map((file) => ({
        url: `/uploads/${file.filename}`, // Stocke le chemin vers le fichier
        visitId: visit.id,
      }));

      await prisma.photo.createMany({
        data: photoEntries,
      });
    }

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

// Endpoint : Les pays les mieux notés
app.get("/api/top-rated", async (req, res) => {
  try {
    // Récupérer les pays avec les scores des visites
    const countriesWithScores = await prisma.country.findMany({
      include: {
        visits: true, // Inclure toutes les visites associées
      },
    });

    // Calculer la moyenne des scores pour chaque pays
    const ratedCountries = countriesWithScores.map((country) => {
      const scores = country.visits.map((visit) => visit.score);
      const averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0; // Si aucun score, la moyenne est 0

      return {
        id: country.id,
        name: country.name,
        code: country.code,
        averageScore: parseFloat(averageScore.toFixed(2)), // Limiter la moyenne à 2 décimales
      };
    });

    // Trier les pays par note moyenne décroissante
    const topRated = ratedCountries
      .filter((country) => country.averageScore > 0) // Exclure les pays sans score
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10); // Limiter aux 10 meilleurs pays

    res.status(200).json(topRated);
  } catch (error) {
    console.error("Erreur lors de la récupération des pays les mieux notés:", error);
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

    // Filtrer les scores pour exclure ceux égaux à zéro
    const validScores = country.visits
      .map((visit) => parseFloat(visit.score || 0)) // Convertir les scores en nombres (remplacer null par 0)
      .filter((score) => score > 0); // Exclure les scores <= 0

    // Calcul de la note moyenne
    const averageRating = validScores.length > 0
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      : 0; // Si aucun score valide, la moyenne est 0

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
        score: visit.score,
      }));

    res.status(200).json({
      id: country.id,
      name: country.name,
      visitsCount: visitedCount,
      visitRequests: wishlistCount,
      averageRating: parseFloat(averageRating.toFixed(2)),
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
