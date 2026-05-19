const fs = require('fs').promises;

class DatabaseService {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  async readDB() {
    const raw = await fs.readFile(this.dbPath, 'utf8');
    return JSON.parse(raw);
  }

  async writeDB(data) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  createAdminUser() {
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

  async ensureAdminUser() {
    const db = await this.readDB();
    if (!db.users) {
      db.users = [];
    }

    const existingAdmin = db.users.find((u) => u.email === 'ddu.edu.et' && u.role === 'admin');
    if (!existingAdmin) {
      db.users.unshift(this.createAdminUser());
      await this.writeDB(db);
    }
  }

  async initializeDB() {
    try {
      const db = await this.readDB();
      if (!db.departments) {
        db.departments = ['Computer Science', 'Engineering', 'Software', 'IT', 'Arts & Humanities'];
        await this.writeDB(db);
      }
      await this.ensureAdminUser();
    } catch (err) {
      const initialData = { 
        users: [this.createAdminUser()], 
        teachers: [], 
        feedbacks: [], 
        departments: ['Computer Science', 'Engineering', 'Software', 'IT', 'Arts & Humanities'] 
      };
      await this.writeDB(initialData);
    }
  }
}

module.exports = DatabaseService;
