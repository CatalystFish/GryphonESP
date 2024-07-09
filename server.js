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
    res.redirect('/choose-company');
  } else {
    console.log('Authentication failed');
    res.status(401).send('Unauthorized');
  }
});

// Serve choose company page
app.get('/choose-company', (req, res) => {
  console.log('Serving choose-company.html');
  res.sendFile(path.join(__dirname, 'choose-company.html'), (err) => {
    if (err) {
      console.log('Error serving choose-company.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Handle company selection
app.post('/choose-company', (req, res) => {
  const { company } = req.body;
  res.redirect(`/visitor-sign-in?company=${company}`);
});

// Serve visitor sign-in page
app.get('/visitor-sign-in', (req, res) => {
  console.log('Serving visitor-sign-in.html');
  res.sendFile(path.join(__dirname, 'visitor-sign-in.html'), (err) => {
    if (err) {
      console.log('Error serving visitor-sign-in.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Handle visitor sign-in form submission
app.post('/visitor-signin', async (req, res) => {
  const { firstName, lastName, company, licensePlate, makeModel, testingCompleted } = req.body;
  console.log('Received visitor sign-in request:', { firstName, lastName, company, licensePlate, makeModel, testingCompleted });

  try {
    const { data, error } = await supabase
      .from('signins')
      .insert([{ firstName, lastName, company, licensePlate, makeModel, testingCompleted: !!testingCompleted, signInTime: new Date() }]);

    if (error) {
      throw error;
    }

    console.log('Inserted data into signins:', data);
    res.redirect('/post-sign-in');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Error inserting data: ' + error.message);
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

// Serve view all users page
app.get('/view-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('signins')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).send('Error retrieving users: ' + error.message);
  }
});

// Serve daily report page
app.get('/daily-report', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  try {
    const { data, error } = await supabase
      .from('signins')
      .select('*')
      .gte('signInTime', `${today}T00:00:00`)
      .lt('signInTime', `${today}T23:59:59`);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).send('Error generating daily report: ' + error.message);
  }
});

// Handle sign-out with one click
app.post('/signout-user', async (req, res) => {
  const { id } = req.body;
  console.log('Received sign-out request:', { id });

  try {
    const { data, error } = await supabase
      .from('signins')
      .update({ signOutTime: new Date() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('Updated signout time:', data);
    res.redirect('/view-users');
  } catch (error) {
    console.error('Error updating signout time:', error);
    res.status(500).send('Error updating signout time: ' + error.message);
  }
});


// Handle sign-out
app.post('/signout', async (req, res) => {
  const { id } = req.body;
  console.log('Received sign-out request:', { id });

  try {
    const { data, error } = await supabase
      .from('signins')
      .update({ signOutTime: new Date() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('Updated signout time:', data);
    res.redirect('/visitor-sign-in');
  } catch (error) {
    console.error('Error updating signout time:', error);
    res.status(500).send('Error updating signout time: ' + error.message);
  }
});

// Handle report generation
app.get('/report', async (req, res) => {
  const { date } = req.query;
  console.log('Received report request for date:', date);

  try {
    const { data, error } = await supabase
      .from('signins')
      .select('*')
      .gte('signInTime', date ? new Date(date).toISOString() : new Date().toISOString());

    if (error) {
      throw error;
    }

    console.log('Report data:', data);
    res.json(data);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Error generating report: ' + error.message);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
