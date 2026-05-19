class FeedbackController {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async getAllFeedbacks(req, res) {
    const db = await this.dbService.readDB();
    res.json(db.feedbacks);
  }

  async submitFeedback(req, res) {
    const { userId, teacherId, rating, comments, recommend } = req.body;
    if (!userId || !teacherId || typeof rating !== 'number' || !recommend) {
      return res.status(400).json({ message: 'Missing required feedback fields.' });
    }

    const db = await this.dbService.readDB();
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

    await this.dbService.writeDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    res.status(201).json({ feedback: newFeedback, user: safeUser, teacher });
  }

  async likeFeedback(req, res) {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const db = await this.dbService.readDB();
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

    await this.dbService.writeDB(db);
    res.json(feedback);
  }

  async dislikeFeedback(req, res) {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const db = await this.dbService.readDB();
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

    await this.dbService.writeDB(db);
    res.json(feedback);
  }

  async deleteFeedback(req, res) {
    const { id } = req.params;
    const db = await this.dbService.readDB();

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

    await this.dbService.writeDB(db);
    res.json({ message: 'Feedback deleted successfully.' });
  }
}

module.exports = FeedbackController;
