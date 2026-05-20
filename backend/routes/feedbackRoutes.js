const express = require('express');
const FeedbackController = require('../controllers/FeedbackController');

module.exports = function createFeedbackRoutes(dbService) {
  const router = express.Router();
  const feedbackController = new FeedbackController(dbService);

  router.get('/feedbacks', (req, res) => feedbackController.getAllFeedbacks(req, res));
  router.post('/feedbacks', (req, res) => feedbackController.submitFeedback(req, res));
  router.post('/feedbacks/:id/like', (req, res) => feedbackController.likeFeedback(req, res));
  router.post('/feedbacks/:id/dislike', (req, res) => feedbackController.dislikeFeedback(req, res));
  router.delete('/feedbacks/:id', (req, res) => feedbackController.deleteFeedback(req, res));

  return router;
};
