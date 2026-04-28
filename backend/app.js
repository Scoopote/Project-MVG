const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const dns = require("node:dns/promises");

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

const app = express();

async function connectMongo() {
  try {
    await mongoose.connect(
      `mongodb+srv://Scoopote:${process.env.PASSWORD}@cluster0.xytjy5r.mongodb.net/mvg?retryWrites=true&w=majority`,
      {
        serverSelectionTimeoutMS: 5000
      }
    );
    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    console.log('Connexion à MongoDB échouée !');
    console.log(error);
  }
}

connectMongo();

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;