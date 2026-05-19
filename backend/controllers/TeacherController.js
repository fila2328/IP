class TeacherController {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async getTeachers(req, res) {
    const db = await this.dbService.readDB();
    res.json(db.teachers);
  }

  async createTeacher(req, res) {
    const { name, department, subject, rating } = req.body;
    if (!name || !department || !subject) {
      return res.status(400).json({ message: 'Teacher name, department, and subject are required.' });
    }

    const db = await this.dbService.readDB();
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
    await this.dbService.writeDB(db);
    res.status(201).json(newTeacher);
  }

  async updateTeacher(req, res) {
    const { id } = req.params;
    const { name, department, subject, rating } = req.body;
    const db = await this.dbService.readDB();
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
      if (Number(feedback.teacherId) === Number(teacher.id)) {
        feedback.teacherName = teacher.name;
        feedback.teacherDepartment = teacher.department;
        feedback.teacherSubject = teacher.subject;
      }
    });

    await this.dbService.writeDB(db);
    res.json(teacher);
  }

  async deleteTeacher(req, res) {
    const { id } = req.params;
    const db = await this.dbService.readDB();
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

    await this.dbService.writeDB(db);
    res.json({ message: 'Teacher deleted successfully.' });
  }
}

module.exports = TeacherController;
