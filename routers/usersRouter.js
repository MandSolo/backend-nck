const usersRouter = require('express').Router();
const { getAllUsers, getUserByUsername } = require('../controllers/usersController');
const { handle405 } = require('../errors/index.js');

usersRouter
  .route('/')
  .get(getAllUsers)
  .all(handle405);

usersRouter
  .route('/:username')
  .get(getUserByUsername);

module.exports = usersRouter;
