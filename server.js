const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database connection
const client = new Client({
  connectionString: process.env.postgres://default:tEYx6NiBd5hS@ep-fragrant-violet-a4dgy813.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require, // Use your Vercel Postgres database URL here
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

// Handle sign-in form submission
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  // Validate and authenticate user
  res.redirect('/post-sign-in');
});

// Handle dynamic form submission
app.post('/dynamic-sign-in', (req, res) => {
  const { firstName, lastName, company, additionalData } = req.body;
  client.query('INSERT INTO signins (firstName, lastName, company, additionalData) VALUES ($1, $2, $3, $4)', 
               [firstName, lastName, company, additionalData], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving data');
    } else {
      res.redirect('/post-sign-in');
    }
  });
});

// Handle sign-out
app.post('/signout', (req, res) => {
  const { id } = req.body;
  client.query('UPDATE signins SET signOutTime = CURRENT_TIMESTAMP WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating sign-out time');
    } else {
      res.redirect('/post-sign-in');
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on
