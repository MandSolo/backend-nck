const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routers/apiRouter.js');
const { handle400, handle405 } = require('./errors/index.js');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  res.status(404).json({ msg: 'error page not found' });
});

app.use(handle400);
app.use(handle405);

// app.use((err, req, res, next) => {
//   res.status(500).json({ msg: 'server error' });
// });


module.exports = app;
