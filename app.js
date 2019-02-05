const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter.js');
const {
  handle400, handle405, handle422, handle500, handle404,
} = require('./errors/index.js');

app.use(cors());

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  next({ status: 404, msg: 'error page not found' });
});

app.use(handle404);
app.use(handle422);
app.use(handle400);
app.use(handle405);
app.use(handle500);

module.exports = app;
