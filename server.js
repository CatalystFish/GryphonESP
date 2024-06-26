const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();

// Initialize Supabase client
const supabaseUrl = 'https://zskacxgupskbhdrfaapm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpza2FjeGd1cHNrYmhkcmZhYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0MjAzMDIsImV4cCI6MjAzNDk5NjMwMn0.CHP3qlJFXi8U0S55rtJzMxcLHO-gf32x6zwg-ucX3Qc';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Initialize database
async function initializeDatabase() {
  const { data, error } = await supabase
    .from('signins')
    .select('*');

  if (error) {
    console.error('Error fetching table:', error);
  } else {
    console.log('Table fetched or already exists.');
  }
}

initializeDatabase();

// Simple test login mechanism
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  // For testing, accept any username and password
  if (username && password) {
    res.redirect('/post-sign-in');
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Handle dynamic form submission
app.post('/dynamic-sign-in', async (req, res) => {
  const { firstName, lastName, company, additionalData } = req.body;
  const { data, error } = await supabase
    .from('signins')
    .insert([{ firstName, lastName, company, additionalData }]);

  if (error) {
    console.error('Error inserting data:', error);
    res.status(500).send(error.message);
  } else {
    res.redirect('/post-sign-in');
  }
});

// Handle sign-out
app.post('/signout', async (req, res) => {
  const { id } = req.body;
  const { data, error } = await supabase
    .from('signins')
    .update({ signOutTime: new Date() })
    .eq('id', id);

  if (error) {
    console.error('Error updating data:', error);
    res.status(500).send(error.message);
  } else {
    res.redirect('/post-sign-in');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
