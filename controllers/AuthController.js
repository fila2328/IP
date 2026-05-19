class AuthController {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const db = await this.dbService.readDB();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  }

  async register(req, res) {
    const { name, studentId, email, department, password } = req.body;
    if (!name || !studentId || !email || !department || !password) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }

    const db = await this.dbService.readDB();
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
    await this.dbService.writeDB(db);

    const safeUser = { ...newUser };
    delete safeUser.password;
    res.status(201).json(safeUser);
  }
}

module.exports = AuthController;
