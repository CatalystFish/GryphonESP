const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Serve static files from the root

// Handle sign-in form submission
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  console.log('Received sign-in request:', { username, password });

  // Check credentials against the users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password);

  console.log('Supabase query result:', { data, error });

  if (data && data.length > 0) {
    console.log('Authentication successful');
    res.redirect('/post-sign-in');
  } else {
    console.log('Authentication failed');
    res.status(401).send('Unauthorized');
  }
});

// Serve post-sign-in page
app.get('/post-sign-in', (req, res) => {
  console.log('Serving post-sign-in.html');
  res.sendFile(path.join(__dirname, 'post-sign-in.html'), (err) => {
    if (err) {
      console.log('Error serving post-sign-in.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
