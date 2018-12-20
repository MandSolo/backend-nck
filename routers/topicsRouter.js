const topicsRouter = require('express').Router();
const {
  getAllTopics, addTopic, getAllArticlesForTopic, addArticle,
} = require('../controllers/topicsController');
const { handle405 } = require('../errors/index.js');

topicsRouter
  .route('/')
  .get(getAllTopics)
  .post(addTopic)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getAllArticlesForTopic)
  .post(addArticle)
  .all(handle405);

module.exports = topicsRouter;
