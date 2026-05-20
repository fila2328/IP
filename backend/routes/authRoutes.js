const express = require('express');
const AuthController = require('../controllers/AuthController');

module.exports = function createAuthRoutes(dbService) {
  const router = express.Router();
  const authController = new AuthController(dbService);

  router.post('/login', (req, res) => authController.login(req, res));
  router.post('/register', (req, res) => authController.register(req, res));

  return router;
};
