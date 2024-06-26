const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('./db/database.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle sign-in form submission
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  // Validate and authenticate user
  // Redirect to post-sign-in page
  res.redirect('/post-sign-in');
});

// Serve post-sign-in page
app.get('/post-sign-in', (req, res) => {
  res.sendFile(__dirname + '/post-sign-in.html');
});

// Handle dynamic form submission
app.post('/dynamic-sign-in', (req, res) => {
  const { firstName, lastName, company, additionalData } = req.body;
  // Save data to database
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
  // Update sign-out time in database
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
