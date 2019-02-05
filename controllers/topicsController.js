/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

const connection = require('../db/connection');

exports.getAllTopics = (req, res, next) => {
  connection
    .select('*')
    .from('topics')
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.addTopic = (req, res, next) => {
  connection
    .returning('*')
    .insert(req.body)
    .into('topics')
    .then(([topic]) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.getAllArticlesForTopic = (req, res, next) => {
  const { topic } = req.params;
  const { limit: maxResult = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') {
    order_by = 'asc';
  }
  const validSortQueries = [
    'title',
    'author',
    'article_id',
    'created_at',
    'topic',
    'votes',
    'comment_count',
  ];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(maxResult)) { return next({ status: 400, msg: 'invalid input syntax for type integer' }); }
  if (isNaN(p)) { return next({ status: 400, msg: 'invalid input syntax for type integer' }); }

  return connection
    .select(
      'articles.body',
      'articles.title',
      'articles.username AS author',
      'articles.article_id',
      'articles.created_at',
      'articles.topic',
      'articles.votes',
    )
    .from('articles')
    .groupBy('articles.article_id')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .leftJoin('users', 'users.username', '=', 'articles.username')
    .count('comments.comment_id AS comment_count')
    .where({ topic })
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then(articles => res.status(200).send({ articles }))
    .catch(next);
};

exports.addArticle = (req, res, next) => {
  const { topic } = req.params;
  const { title, username, body } = req.body;

  return connection('articles')
    .insert({
      title,
      topic,
      body,
      username,
    })
    .returning('*')
    .then(([article]) => res.status(201).send({ article }))
    .catch(next);
};
