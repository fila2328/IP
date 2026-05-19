const express = require('express');
const cors = require('cors');
const path = require('path');

const DatabaseService = require('./services/DatabaseService');
const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const TeacherController = require('./controllers/TeacherController');
const FeedbackController = require('./controllers/FeedbackController');
const DepartmentController = require('./controllers/DepartmentController');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Database Service
const dbService = new DatabaseService(DB_PATH);

// Initialize Controllers
const authController = new AuthController(dbService);
const userController = new UserController(dbService);
const teacherController = new TeacherController(dbService);
const feedbackController = new FeedbackController(dbService);
const departmentController = new DepartmentController(dbService);

// Health Route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth Routes
app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/register', (req, res) => authController.register(req, res));

// Stats & Users (Students) Routes
app.get('/api/stats', (req, res) => userController.getStats(req, res));
app.get('/api/students', (req, res) => userController.getStudents(req, res));
app.delete('/api/students/:id', (req, res) => userController.deleteStudent(req, res));

// Teacher Routes
app.get('/api/teachers', (req, res) => teacherController.getTeachers(req, res));
app.post('/api/teachers', (req, res) => teacherController.createTeacher(req, res));
app.put('/api/teachers/:id', (req, res) => teacherController.updateTeacher(req, res));
app.delete('/api/teachers/:id', (req, res) => teacherController.deleteTeacher(req, res));

// Feedback Routes
app.get('/api/feedbacks', (req, res) => feedbackController.getAllFeedbacks(req, res));
app.post('/api/feedbacks', (req, res) => feedbackController.submitFeedback(req, res));
app.post('/api/feedbacks/:id/like', (req, res) => feedbackController.likeFeedback(req, res));
app.post('/api/feedbacks/:id/dislike', (req, res) => feedbackController.dislikeFeedback(req, res));
app.delete('/api/feedbacks/:id', (req, res) => feedbackController.deleteFeedback(req, res));

// Department Routes
app.get('/api/departments', (req, res) => departmentController.getDepartments(req, res));
app.post('/api/departments', (req, res) => departmentController.addDepartment(req, res));
app.delete('/api/departments/:name', (req, res) => departmentController.deleteDepartment(req, res));

// Fallback Route for frontend
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
async function startServer() {
  await dbService.initializeDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
