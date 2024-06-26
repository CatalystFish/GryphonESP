const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this environment variable is set in Vercel
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Initialize database
pool.query(`
  CREATE TABLE IF NOT EXISTS signins (
    id SERIAL PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    company TEXT NOT NULL,
    additionalData TEXT,
    signInTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signOutTime TIMESTAMP
  );
`, (err, res) => {
  if (err) throw err;
});

// Handle sign-in form submission
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  // Validate and authenticate user
  res.redirect('/post-sign-in');
});

// Handle dynamic form submission
app.post('/dynamic-sign-in', (req, res) => {
  const { firstName, lastName, company, additionalData } = req.body;
  pool.query(`
    INSERT INTO signins (firstName, lastName, company, additionalData) 
    VALUES ($1, $2, $3, $4)
  `, [firstName, lastName, company, additionalData], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      res.redirect('/post-sign-in');
    }
  });
});

// Handle sign-out
app.post('/signout', (req, res) => {
  const { id } = req.body;
  pool.query(`
    UPDATE signins SET signOutTime = CURRENT_TIMESTAMP WHERE id = $1
  `, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      res.redirect('/post-sign-in');
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports = app;
