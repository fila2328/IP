const express = require('express');
const TeacherController = require('../controllers/TeacherController');

module.exports = function createTeacherRoutes(dbService) {
  const router = express.Router();
  const teacherController = new TeacherController(dbService);

  router.get('/teachers', (req, res) => teacherController.getTeachers(req, res));
  router.post('/teachers', (req, res) => teacherController.createTeacher(req, res));
  router.put('/teachers/:id', (req, res) => teacherController.updateTeacher(req, res));
  router.delete('/teachers/:id', (req, res) => teacherController.deleteTeacher(req, res));

  return router;
};
