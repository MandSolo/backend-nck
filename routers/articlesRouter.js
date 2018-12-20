const articlesRouter = require('express').Router();
const { getAllArticles, getArticleByID, updateVotesForArticle } = require('../controllers/articlesController');

articlesRouter
  .route('/')
  .get(getAllArticles);

articlesRouter
  .route('/:article_id')
  .get(getArticleByID)
  .patch(updateVotesForArticle);


module.exports = articlesRouter;
