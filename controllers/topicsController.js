/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

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

exports.getAllArticlesForTopic = (req, res, next) => {
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

  // Queries!!!!!!!!!!!!
  // This route should accept the following queries:
  // limit, which limits the number of responses (defaults to 10)
  // sort_by, which sorts the articles by any valid column (defaults to date)
  // p, stands for page which specifies the page at which to start (calculated using limit)
  // sort_ascending, when "true" returns the results sorted in ascending order (defaults to descending)

  // IMPORTANT:
  // Both comments and articles data in the test-data are given ordered in descending order of time :
  // this will be useful to you when it comes to writing your tests!

  const { topic } = req.params;
  const { limit: maxResult = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') { order_by = 'asc'; }
  const validSortQueries = ['title', 'author', 'article_id', 'created_at', 'topic', 'votes', 'comment_count'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(maxResult)) return next({ status: 400, msg: 'invalid input syntax for type integer' });
  if (isNaN(p)) return next({ status: 400, msg: 'invalid input syntax for type integer' });

  return connection.select(
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
  // accepts an object containing a title, body and a username property
  // responds with the posted article

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
