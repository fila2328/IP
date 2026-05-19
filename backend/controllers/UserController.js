class UserController {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async getStats(req, res) {
    const db = await this.dbService.readDB();
    const studentCount = db.users.filter((u) => u.role !== 'admin').length;
    res.json({ userCount: db.users.length, studentCount, teacherCount: db.teachers.length, feedbackCount: db.feedbacks.length });
  }

  async getStudents(req, res) {
    const db = await this.dbService.readDB();
    res.json(db.users.filter((u) => u.role !== 'admin'));
  }

  async deleteStudent(req, res) {
    const { id } = req.params;
    const db = await this.dbService.readDB();
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
      } else {
        teacher.rating = 4.0; // Default rating if no feedbacks left
      }
    });

    await this.dbService.writeDB(db);
    res.json({ message: 'Student deleted successfully.' });
  }
}

module.exports = UserController;
