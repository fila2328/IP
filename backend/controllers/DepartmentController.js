class DepartmentController {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async getDepartments(req, res) {
    const db = await this.dbService.readDB();
    res.json(db.departments || []);
  }

  async addDepartment(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const db = await this.dbService.readDB();
    if (!db.departments) db.departments = [];
    
    if (db.departments.some(d => d.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ message: 'Department already exists' });
    }

    db.departments.push(name);
    await this.dbService.writeDB(db);
    res.status(201).json(name);
  }

  async deleteDepartment(req, res) {
    const { name } = req.params;
    const db = await this.dbService.readDB();
    if (!db.departments) return res.status(404).json({ message: 'Department not found' });

    const index = db.departments.findIndex(d => d.toLowerCase() === name.toLowerCase());
    if (index === -1) return res.status(404).json({ message: 'Department not found' });

    db.departments.splice(index, 1);
    await this.dbService.writeDB(db);
    res.json({ message: 'Department deleted successfully' });
  }
}

module.exports = DepartmentController;
