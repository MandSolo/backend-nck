/*  eslint "no-console": 0 */
const app = require('./app.js');

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`server listening on port ${PORT}...`);
});
