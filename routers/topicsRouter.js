const topicsRouter = require('express').Router();
const {
  getAllTopics, addTopic, getAllTopicsForArticle,
} = require('../controllers/topicsController');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(addTopic);

topicsRouter
  .route('/:topic/articles')
  .get(getAllTopicsForArticle);

module.exports = topicsRouter;
