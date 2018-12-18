const apiRouter = require('express').Router();
const topicsRouter = require('./topicsRouter.js');

apiRouter.use('/topics', topicsRouter);

module.exports = apiRouter;
