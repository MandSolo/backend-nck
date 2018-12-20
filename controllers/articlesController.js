/*  eslint "max-len": 0,
"no-restricted-globals": 0,
*/

const connection = require('../db/connection');

exports.getAllArticles = (req, res, next) => {
// responds with an array of article objects
// each article should have:
// author which is the username from the users table,
// title
// article_id
// body
// votes
// comment_count which is the accumulated count of all the comments with this article_id. You should make use of knex queries in order to achieve this.
// created_at
// topic

  // Queries!!!!!!!!!!
  // This route should accept the following queries:
  // limit, which limits the number of responses (defaults to 10)
  // sort_by, which sorts the articles by any valid column (defaults to date)
  // p, stands for page which specifies the page at which to start (calculated using limit)
  // sort_ascending, when "true" returns the results sorted in ascending order (defaults to descending)

  const { limit: maxResult = 10, sort_ascending, p = 1 } = req.query;
  let { sort_by } = req.query;
  let order_by = 'desc';
  if (sort_ascending === 'true') { order_by = 'asc'; }
  const validSortQueries = ['title', 'author', 'article_id', 'created_at', 'topic', 'votes', 'comment_count'];
  if (!validSortQueries.includes(sort_by)) sort_by = 'created_at';
  if (isNaN(maxResult)) return next({ status: 400, msg: 'invalid input syntax for type integer' });
  if (isNaN(p)) return next({ status: 400, msg: 'invalid input syntax for type integer' });

  return connection.select(
    'articles.username AS author',
    'articles.title',
    'articles.article_id',
    'articles.votes',
    'articles.body',
    'articles.created_at',
    'articles.topic',
  )
    .from('comments')
    .rightJoin('articles', 'articles.article_id', '=', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id')
    .limit(maxResult)
    .offset(maxResult * (p - 1))
    .orderBy(sort_by, order_by)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleByID = (req, res, next) => {
  // responds with an article object
  // each article should have:
  // article_id
  // author which is the username from the users table,
  // title
  // votes
  // body
  // comment_count which is the count of all the comments with this article_id. A particular SQL clause is useful for this job!
  // created_at
  // topic

  const { article_id } = req.params;

  connection('articles')
    .select(
      'users.username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
      'articles.body',
    )
    .join('users', 'articles.username', 'users.username')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .where('articles.article_id', article_id)
    .groupBy('articles.article_id', 'users.username')
    .then((articles) => {
      if (articles.length === 0) return Promise.reject({ status: 404, msg: 'error page not found' });
      return res.status(200).send({ articles });
    })
    .catch(next);
};

exports.updateVotesForArticle = (req, res, next) => {
  // accepts an object in the form { inc_votes: newVote }
  // newVote will indicate how much the votes property in the database should be updated by
  // E.g { inc_votes : 1 } would increment the current article's vote property by 1
  // { inc_votes : -100 } would decrement the current article's vote property by 100

  const { article_id } = req.params;
  const { inc_votes } = req.body;
  connection('articles')
    .where('article_id', '=', article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then(([article]) => {
      if (article.length === 0) return Promise.reject({ status: 404, message: 'page not found' });
      return res.status(202).send({ article });
    })
    .catch(next);
};
