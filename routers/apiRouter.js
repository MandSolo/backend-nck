const apiRouter = require('express').Router();
const topicsRouter = require('../routers/topicsRouter');

apiRouter.use('/topics', topicsRouter);

module.exports = apiRouter;
