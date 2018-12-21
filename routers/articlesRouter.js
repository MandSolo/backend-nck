const articlesRouter = require('express').Router();
const {
  getAllArticles, getArticleByID, updateVotesForArticle, deleteArticleByID,
  getCommentsByArticleID, addComment, updateCommentVotes, deleteCommentByID,
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
  .get(getCommentsByArticleID)
  .post(addComment);

articlesRouter
  .route('/:article_id/comments/:comment_id')
  .patch(updateCommentVotes)
  .delete(deleteCommentByID)
  .all(handle405);

module.exports = articlesRouter;
