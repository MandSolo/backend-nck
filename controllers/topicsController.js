const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
// responds with an array of topic objects - each object should have a slug and description property
  connection
    .select('*')
    .from('topics')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.addTopic = (req, res, next) => {
// accepts an object containing slug and description property, the slug must be unique
// responds with the posted topic object
  connection
    .returning('*')
    .insert(req.body)
    .into('topics')
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getAllTopicsForArticle = (req, res, next) => {
// responds with an array of article objects for a given topic
// each article should have:
// author which is the username from the users table,
// title
// article_id
// votes
// created_at
// topic
// comment_count which is the accumulated count of all the comments with this article_id.
// You should make use of knex queries in order to achieve this.
  const { topic } = req.params;
  return connection.select(
    'articles.title',
    'articles.topic',
    'articles.username AS author',
    'articles.article_id',
    'articles.created_at',
    'articles.votes',
  )
    .from('articles')
    .groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .leftJoin('users', 'users.username', '=', 'articles.username')
    .count('comments.comment_id AS comment_count')
    .where({ topic })
    .then(articles => res.status(200).send({ articles }));
};
