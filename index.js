const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ===== Routes ===== //

// Get all procurements
app.get('/api/procurements', async (req, res) => {
  const data = await prisma.procurement.findMany({ orderBy: { date: 'desc' } });
  res.json(data);
});

// Create procurement
app.post('/api/procurements', async (req, res) => {
  const { produce, quantity, price } = req.body;
  try {
    const item = await prisma.procurement.create({
      data: { produce, quantity: parseFloat(quantity), price: parseFloat(price) }
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all sales
app.get('/api/sales', async (req, res) => {
  const data = await prisma.sale.findMany({ orderBy: { date: 'desc' } });
  res.json(data);
});

// Create sale
app.post('/api/sales', async (req, res) => {
  const { produce, quantity, amount, buyer } = req.body;
  try {
    const sale = await prisma.sale.create({
      data: { produce, quantity: parseFloat(quantity), amount: parseFloat(amount), buyer }
    });
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('FarmTrack API is running...');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
