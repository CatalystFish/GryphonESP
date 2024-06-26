-- Create the signins table
CREATE TABLE signins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  company TEXT NOT NULL,
  additionalData TEXT,
  signInTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  signOutTime TIMESTAMP
);
