const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Routes
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Endpoint pour récupérer les visites d'un utilisateur
app.get('/visits', async (req, res) => {
  const { userId } = req.query;
  try {
    const visits = await prisma.visit.findMany({
      where: { userId: parseInt(userId) },
      include: { country: true, photos: true },
    });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des visites' });
  }
});

// Endpoint pour ajouter ou mettre à jour une visite
app.post('/visits', async (req, res) => {
  const { userId, countryId, status, description } = req.body;
  try {
    const visit = await prisma.visit.upsert({
      where: { userId_countryId: { userId, countryId } },
      update: { status, description },
      create: { userId, countryId, status, description },
    });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la visite' });
  }
});

// Endpoint pour récupérer la liste des pays
app.get('/countries', async (req, res) => {
  try {
    const countries = await prisma.country.findMany();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des pays' });
  }
});

app.post('/api/country/update', async (req, res) => {
  const { userId, countryCode, state } = req.body;
  try {
    const country = await prisma.country.findUnique({ where: { code: countryCode } });
    if (!country) {
      return res.status(404).json({ error: 'Pays non trouvé' });
    }

    await prisma.visit.upsert({
      where: { userId_countryId: { userId: parseInt(userId), countryId: country.id } },
      update: { status: state },
      create: { userId: parseInt(userId), countryId: country.id, status: state },
    });

    res.json({ message: 'Pays mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du pays' });
  }
});

app.get('/api/countries/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const visits = await prisma.visit.findMany({
      where: { userId: parseInt(userId) },
      include: { country: true },
    });
    const data = visits.map((visit) => ({
      countryCode: visit.country.code,
      state: visit.status,
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des pays' });
  }
});

// Endpoint pour récupérer les couleurs des statuts
app.get('/status-colors', async (req, res) => {
  try {
    const statusColors = await prisma.statusColor.findMany();
    res.json(statusColors);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des couleurs des statuts' });
  }
});

// Middleware global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = 3002;
app.listen(PORT, 'localhost', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
