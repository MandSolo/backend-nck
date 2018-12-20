const articlesRouter = require('express').Router();
const {
  getAllArticles, getArticleByID, updateVotesForArticle, deleteArticleByID, getCommentsByArticleID,
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

articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleID);

module.exports = articlesRouter;
