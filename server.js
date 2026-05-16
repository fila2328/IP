const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function readDB() {
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function createAdminUser() {
  return {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'ddu.edu.et',
    password: 'ddu123',
    role: 'admin',
    department: 'Administration',
    createdAt: new Date().toISOString(),
    feedbacks: []
  };
}

async function ensureAdminUser(db) {
  if (!db.users) {
    db.users = [];
  }

  const existingAdmin = db.users.find((u) => u.email === 'ddu.edu.et' && u.role === 'admin');
  if (!existingAdmin) {
    db.users.unshift(createAdminUser());
    await writeDB(db);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stats', async (req, res) => {
  const db = await readDB();
  const studentCount = db.users.filter((u) => u.role !== 'admin').length;
  res.json({ userCount: db.users.length, studentCount, teacherCount: db.teachers.length, feedbackCount: db.feedbacks.length });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = await readDB();
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const safeUser = { ...user };
  delete safeUser.password;
  res.json(safeUser);
});

app.post('/api/auth/register', async (req, res) => {
  const { name, studentId, email, department, password } = req.body;
  if (!name || !studentId || !email || !department || !password) {
    return res.status(400).json({ message: 'All registration fields are required.' });
  }

  const db = await readDB();
  const existingEmail = db.users.find((u) => u.email === email);
  const existingStudentId = db.users.find((u) => u.studentId === studentId);

  if (existingEmail) {
    return res.status(409).json({ message: 'This email is already registered.' });
  }
  if (existingStudentId) {
    return res.status(409).json({ message: 'This student ID is already registered.' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    studentId,
    email,
    department,
    password,
    role: 'student',
    createdAt: new Date().toISOString(),
    feedbacks: []
  };

  db.users.push(newUser);
  await writeDB(db);

  const safeUser = { ...newUser };
  delete safeUser.password;
  res.status(201).json(safeUser);
});

app.get('/api/teachers', async (req, res) => {
  const db = await readDB();
  res.json(db.teachers);
});

app.post('/api/feedbacks', async (req, res) => {
  const { userId, teacherId, rating, comments, recommend } = req.body;
  if (!userId || !teacherId || typeof rating !== 'number' || !recommend) {
    return res.status(400).json({ message: 'Missing required feedback fields.' });
  }

  const db = await readDB();
  const user = db.users.find((u) => u.id === userId);
  const teacher = db.teachers.find((t) => Number(t.id) === Number(teacherId));
  if (!user || !teacher) {
    return res.status(404).json({ message: 'User or teacher not found.' });
  }

  const newFeedback = {
    id: Date.now().toString(),
    userId: user.id,
    userName: user.name,
    teacherId: teacher.id,
    teacherName: teacher.name,
    teacherDepartment: teacher.department,
    teacherSubject: teacher.subject,
    rating,
    comments,
    recommend,
    submittedAt: new Date().toISOString(),
    likes: [],
    dislikes: []
  };

  db.feedbacks.push(newFeedback);
  teacher.feedbackCount = (teacher.feedbackCount || 0) + 1;
  const currentTotal = teacher.rating * (teacher.feedbackCount - 1);
  teacher.rating = Number(((currentTotal + rating) / teacher.feedbackCount).toFixed(1));

  if (!user.feedbacks) {
    user.feedbacks = [];
  }
  user.feedbacks.push(newFeedback);

  await writeDB(db);

  const safeUser = { ...user };
  delete safeUser.password;
  res.status(201).json({ feedback: newFeedback, user: safeUser, teacher });
});

app.get('/api/feedbacks', async (req, res) => {
  const db = await readDB();
  res.json(db.feedbacks);
});

app.post('/api/feedbacks/:id/like', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  const db = await readDB();
  const feedback = db.feedbacks.find(f => f.id === id);
  if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

  if (!feedback.likes) feedback.likes = [];
  if (!feedback.dislikes) feedback.dislikes = [];

  // Remove from dislikes if present
  feedback.dislikes = feedback.dislikes.filter(uid => uid !== userId);

  // Toggle like
  const index = feedback.likes.indexOf(userId);
  if (index > -1) {
    feedback.likes.splice(index, 1);
  } else {
    feedback.likes.push(userId);
  }

  await writeDB(db);
  res.json(feedback);
});

app.post('/api/feedbacks/:id/dislike', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  const db = await readDB();
  const feedback = db.feedbacks.find(f => f.id === id);
  if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

  if (!feedback.likes) feedback.likes = [];
  if (!feedback.dislikes) feedback.dislikes = [];

  // Remove from likes if present
  feedback.likes = feedback.likes.filter(uid => uid !== userId);

  // Toggle dislike
  const index = feedback.dislikes.indexOf(userId);
  if (index > -1) {
    feedback.dislikes.splice(index, 1);
  } else {
    feedback.dislikes.push(userId);
  }

  await writeDB(db);
  res.json(feedback);
});

app.delete('/api/feedbacks/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();

  const feedbackIndex = db.feedbacks.findIndex((f) => f.id === id);
  if (feedbackIndex === -1) {
    return res.status(404).json({ message: 'Feedback not found.' });
  }

  const feedback = db.feedbacks.splice(feedbackIndex, 1)[0];
  const user = db.users.find((u) => u.id === feedback.userId);
  if (user && user.feedbacks) {
    user.feedbacks = user.feedbacks.filter((f) => f.id !== feedback.id);
  }

  const teacher = db.teachers.find((t) => Number(t.id) === Number(feedback.teacherId));
  if (teacher) {
    teacher.feedbackCount = Math.max(0, (teacher.feedbackCount || 1) - 1);
  }

  await writeDB(db);
  res.json({ message: 'Feedback deleted successfully.' });
});

app.get('/api/students', async (req, res) => {
  const db = await readDB();
  res.json(db.users.filter((u) => u.role !== 'admin'));
});

app.post('/api/teachers', async (req, res) => {
  const { name, department, subject, rating } = req.body;
  if (!name || !department || !subject) {
    return res.status(400).json({ message: 'Teacher name, department, and subject are required.' });
  }

  const db = await readDB();
  const newTeacher = {
    id: db.teachers.length > 0 ? Math.max(...db.teachers.map((t) => Number(t.id))) + 1 : 1,
    name,
    department,
    subject,
    rating: rating || 4.0,
    feedbackCount: 0,
    avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase(),
    status: 'pending'
  };
  db.teachers.push(newTeacher);
  await writeDB(db);
  res.status(201).json(newTeacher);
});

app.put('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department, subject, rating } = req.body;
  const db = await readDB();
  const teacher = db.teachers.find((t) => Number(t.id) === Number(id));
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found.' });
  }

  teacher.name = name || teacher.name;
  teacher.department = department || teacher.department;
  teacher.subject = subject || teacher.subject;
  teacher.rating = typeof rating === 'number' ? rating : teacher.rating;
  teacher.avatar = teacher.name.split(' ').map((n) => n[0]).join('').toUpperCase();

  db.feedbacks.forEach((feedback) => {
    if (feedback.teacherId === teacher.id) {
      feedback.teacherName = teacher.name;
      feedback.teacherDepartment = teacher.department;
      feedback.teacherSubject = teacher.subject;
    }
  });

  await writeDB(db);
  res.json(teacher);
});

app.delete('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const teacherIndex = db.teachers.findIndex((t) => Number(t.id) === Number(id));
  if (teacherIndex === -1) {
    return res.status(404).json({ message: 'Teacher not found.' });
  }

  db.teachers.splice(teacherIndex, 1);
  db.feedbacks = db.feedbacks.filter((f) => Number(f.teacherId) !== Number(id));
  db.users.forEach((user) => {
    if (user.feedbacks) {
      user.feedbacks = user.feedbacks.filter((f) => Number(f.teacherId) !== Number(id));
    }
  });

  await writeDB(db);
  res.json({ message: 'Teacher deleted successfully.' });
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const db = await readDB();
  const userIndex = db.users.findIndex((u) => u.id === id && u.role !== 'admin');
  if (userIndex === -1) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  db.users.splice(userIndex, 1);
  // Remove feedbacks from this student
  db.feedbacks = db.feedbacks.filter((f) => f.userId !== id);
  // Update teacher feedback counts
  db.teachers.forEach((teacher) => {
    const teacherFeedbacks = db.feedbacks.filter((f) => Number(f.teacherId) === Number(teacher.id));
    teacher.feedbackCount = teacherFeedbacks.length;
    if (teacherFeedbacks.length > 0) {
      teacher.rating = Number((teacherFeedbacks.reduce((sum, f) => sum + f.rating, 0) / teacherFeedbacks.length).toFixed(1));
    }
  });

  await writeDB(db);
  res.json({ message: 'Student deleted successfully.' });
});

app.get('/api/departments', async (req, res) => {
  const db = await readDB();
  res.json(db.departments || []);
});

app.post('/api/departments', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Department name is required' });

  const db = await readDB();
  if (!db.departments) db.departments = [];
  
  if (db.departments.some(d => d.toLowerCase() === name.toLowerCase())) {
    return res.status(409).json({ message: 'Department already exists' });
  }

  db.departments.push(name);
  await writeDB(db);
  res.status(201).json(name);
});

app.delete('/api/departments/:name', async (req, res) => {
  const { name } = req.params;
  const db = await readDB();
  if (!db.departments) return res.status(404).json({ message: 'Department not found' });

  const index = db.departments.findIndex(d => d.toLowerCase() === name.toLowerCase());
  if (index === -1) return res.status(404).json({ message: 'Department not found' });

  db.departments.splice(index, 1);
  await writeDB(db);
  res.json({ message: 'Department deleted successfully' });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

async function startServer() {
  const db = await readDB().catch(async () => {
    const initialData = { 
      users: [createAdminUser()], 
      teachers: [], 
      feedbacks: [], 
      departments: ['Computer Science', 'Engineering', 'Software', 'IT', 'Arts & Humanities'] 
    };
    await writeDB(initialData);
    return initialData;
  });

  if (!db.departments) {
    db.departments = ['Computer Science', 'Engineering', 'Software', 'IT', 'Arts & Humanities'];
    await writeDB(db);
  }

  await ensureAdminUser(db);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
