const topicsRouter = require('express').Router();
const {
  getAllTopics, addTopic, getAllTopicsForArticle,
} = require('../controllers/topicsController');
const { handle405 } = require('../errors/index.js');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(addTopic)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getAllTopicsForArticle)
  .all(handle405);

module.exports = topicsRouter;
