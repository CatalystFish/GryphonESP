const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

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

// Handle sign-in form submission
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  // Check credentials against the users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password);

  if (data && data.length > 0) {
    // Authentication successful
    res.redirect('/post-sign-in');
  } else {
    // Authentication failed
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
