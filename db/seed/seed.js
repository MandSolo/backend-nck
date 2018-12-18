
const {
  topicData, userData, articleData, commentData,
} = require('../data');
const {
  userLookup, formatArticleData, articleLookup, formatCommentData,
} = require('../utils');

exports.seed = function (knex, Promise) {
  return Promise.all([
    knex('topics').del(),
    knex('users').del(),
    knex('articles').del(),
    knex('comments').del(),
  ])

    .then(() => knex('topics').insert(topicData).returning('*'))
    .then(() => knex('users').insert(userData).returning('*'))
    .then((usersRows) => {
      const userLookupObj = userLookup(usersRows);
      const formattedCommentData = formatArticleData(articleData, userLookupObj);
      return Promise.all([userLookupObj, knex('articles').insert(formattedCommentData).returning('*')]);
    })
    .then(([userLookObj, articleRows]) => {
      const articleLookupObj = articleLookup(articleRows);
      const formattedCommentData = formatCommentData(commentData, articleLookupObj, userLookObj);
      return knex('comments').insert(formattedCommentData).returning('*');
    });
};
