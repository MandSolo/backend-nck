const articlesRouter = require('express').Router();
const {
  getAllArticles, getArticleByID, updateVotesForArticle, deleteArticleByID,
} = require('../controllers/articlesController');
const { handle405 } = require('../errors/index.js');

articlesRouter
  .route('/')
  .get(getAllArticles);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .patch(updateVotesForArticle)
  .delete(deleteArticleByID)
  .all(handle405);

module.exports = articlesRouter;
