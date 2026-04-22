const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const stuffRoutes = require('./routes/stuff');
const userRoutes = require('./routes/user');

const app = express();

async function connectMongo() {
  try {
    await mongoose.connect(
      'mongodb+srv://Scoopote:TrolilolDu31@cluster0.xytjy5r.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0',
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

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;