const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter.js');
const articlesRouter = require('./articlesRouter.js');
const usersRouter = require('./usersRouter.js');
const { getEndpointsJSON } = require('../controllers/endpoints.js');

apiRouter
  .route('/')
  .get(getEndpointsJSON);

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
