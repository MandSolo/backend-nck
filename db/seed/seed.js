
const {
  topicData, userData,
  // articleData, commentData,
} = require('../data');
// const { } = require('../utils');

exports.seed = function (knex, Promise) {
  return Promise.all([
    knex('topics').del(),
    knex('users').del(),
  ])

    .then(() => knex('topics').insert(topicData).returning('*'))
    .then(() => knex('users').insert(userData).returning('*'));
};
