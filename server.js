const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // Load environment variables from .env

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Ensure JSON parsing middleware is added
app.use(express.static(path.join(__dirname))); // Serve static files from the root

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
  console.log('Session Data:', req.session);
  if (req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect('/');
  }
}

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
    req.session.isAuthenticated = true;
    req.session.save(err => {
      if (err) {
        console.error('Error saving session:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/choose-company');
      }
    });
  } else {
    console.log('Authentication failed');
    res.status(401).send('Unauthorized');
  }
});

// Serve choose company page
app.get('/choose-company', checkAuth, (req, res) => {
  console.log('Serving choose-company.html');
  res.sendFile(path.join(__dirname, 'choose-company.html'), (err) => {
    if (err) {
      console.log('Error serving choose-company.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Handle company selection
app.post('/choose-company', checkAuth, (req, res) => {
  const { company } = req.body;
  res.redirect(`/visitor-sign-in?company=${company}`);
});

// Serve visitor sign-in page
app.get('/visitor-sign-in', checkAuth, (req, res) => {
  console.log('Serving visitor-sign-in.html');
  res.sendFile(path.join(__dirname, 'visitor-sign-in.html'), (err) => {
    if (err) {
      console.log('Error serving visitor-sign-in.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Handle visitor sign-in form submission
app.post('/visitor-signin', checkAuth, async (req, res) => {
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
    res.redirect('/choose-company');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Error inserting data: ' + error.message);
  }
});

// Serve post-sign-in page
app.get('/post-sign-in', checkAuth, (req, res) => {
  console.log('Serving post-sign-in.html');
  res.sendFile(path.join(__dirname, 'post-sign-in.html'), (err) => {
    if (err) {
      console.log('Error serving post-sign-in.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Serve view users page
app.get('/view-users-page', checkAuth, (req, res) => {
  console.log('Serving view-users.html');
  res.sendFile(path.join(__dirname, 'view-users.html'), (err) => {
    if (err) {
      console.log('Error serving view-users.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Serve daily report page
app.get('/daily-report-page', checkAuth, (req, res) => {
  console.log('Serving daily-report.html');
  res.sendFile(path.join(__dirname, 'daily-report.html'), (err) => {
    if (err) {
      console.log('Error serving daily-report.html:', err);
      res.status(404).send('File not found');
    }
  });
});

// Serve about page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

// Serve contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// Serve view all users data
app.get('/view-users', checkAuth, async (req, res) => {
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

// Serve daily report data
app.get('/daily-report', checkAuth, async (req, res) => {
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
app.post('/signout-user', checkAuth, async (req, res) => {
  const { id } = req.body;
  console.log('Received sign-out request:', { id });

  if (!id) {
    console.error('Invalid user ID:', id);
    return res.status(400).send('Invalid user ID');
  }

  try {
    const { data, error } = await supabase
      .from('signins')
      .update({ signOutTime: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('Updated signout time:', data);
    res.redirect('/view-users-page');
  } catch (error) {
    console.error('Error updating signout time:', error);
    res.status(500).send('Error updating signout time: ' + error.message);
  }
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out.');
    } else {
      res.redirect('/');
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
