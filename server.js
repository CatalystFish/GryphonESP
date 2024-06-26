const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS signins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    company TEXT NOT NULL,
    additionalData TEXT,
    signInTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    signOutTime TIMESTAMP
  )`);
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
  db.run(`INSERT INTO signins (firstName, lastName, company, additionalData) VALUES (?, ?, ?, ?)`, 
         [firstName, lastName, company, JSON.stringify(additionalData)], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/post-sign-in');
  });
});

// Handle sign-out
app.post('/signout', (req, res) => {
  const { id } = req.body;
  db.run(`UPDATE signins SET signOutTime = CURRENT_TIMESTAMP WHERE id = ?`, [id], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.redirect('/post-sign-in');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

module.exports = app;
