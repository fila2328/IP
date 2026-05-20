const express = require('express');
const cors = require('cors');
const path = require('path');

const DatabaseService = require('./services/DatabaseService');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Database Service
const dbService = new DatabaseService(DB_PATH);

// Health Route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API Routers
app.use('/api/auth', authRoutes(dbService));
app.use('/api', userRoutes(dbService));
app.use('/api', teacherRoutes(dbService));
app.use('/api', feedbackRoutes(dbService));
app.use('/api', departmentRoutes(dbService));

// Fallback Route for frontend
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start Server
async function startServer() {
  await dbService.initializeDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
