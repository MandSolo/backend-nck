/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

const connection = require('../db/connection');

exports.getAllUsers = (req, res, next) => {
  // should respond with an array of user objects
  // each user object should have
  // `username`
  // `avatar_url`
  // `name`

  connection('users')
    .select('*')
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  // should respond with a user object
  // each user should have
  // username
  // avatar_url
  // name
  const { username } = req.params;

  return connection
    .select('*')
    .from('users')
    .where('username', username)
    .then(([user]) => {
      if (!user) return Promise.reject({ status: 404, msg: 'error page not found' });
      return res.status(200).send({ user });
    })
    .catch(next);
};
