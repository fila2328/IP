const express = require('express');
const UserController = require('../controllers/UserController');

module.exports = function createUserRoutes(dbService) {
  const router = express.Router();
  const userController = new UserController(dbService);

  router.get('/stats', (req, res) => userController.getStats(req, res));
  router.get('/students', (req, res) => userController.getStudents(req, res));
  router.delete('/students/:id', (req, res) => userController.deleteStudent(req, res));

  return router;
};
