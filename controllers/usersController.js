/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  connection('users')
    .select('*')
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;

  return connection
    .select('*')
    .from('users')
    .where('username', username)
    .then(([user]) => {
      if (!user) { return Promise.reject({ status: 404, msg: 'error page not found' }); }
      return res.status(200).send({ user });
    })
    .catch(next);
};
