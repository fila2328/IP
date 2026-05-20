const express = require('express');
const DepartmentController = require('../controllers/DepartmentController');

module.exports = function createDepartmentRoutes(dbService) {
  const router = express.Router();
  const departmentController = new DepartmentController(dbService);

  router.get('/departments', (req, res) => departmentController.getDepartments(req, res));
  router.post('/departments', (req, res) => departmentController.addDepartment(req, res));
  router.delete('/departments/:name', (req, res) => departmentController.deleteDepartment(req, res));

  return router;
};
