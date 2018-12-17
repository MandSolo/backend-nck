
const {
  topicData,
  // userData, articleData, commentData,
} = require('../data');
// const { } = require('../utils');

exports.seed = function (knex, Promise) {
  return knex('topics').del()
    .then(() => knex('topics').insert(topicData).returning('*'))
    .then(console.log);
};
