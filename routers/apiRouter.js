const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter.js');
const articlesRouter = require('./articlesRouter.js');
const usersRouter = require('./usersRouter.js');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/articles', articlesRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
