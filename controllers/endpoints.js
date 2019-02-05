exports.getEndpointsJSON = (req, res, next) => {
  const endpoints = {
    '/api': 'GET',
    '/api/topics': 'GET - responds with an array of topic objects',
    '/api/topics': 'POST - accepts and responds with a posted topic object',
    '/api/topics/:topic/articles':
      'GET - responds with an array of articles for a given topic',
    '/api/topics/:topic/articles':
      'POST - accepts and responds with a posted article object',
    '/api/articles': 'GET - responds with an array of article objects',
    '/api/articles/:article_id': 'GET - responds with an article object',
    '/api/articles/:article_id':
      'PATCH - accepts and respondes with updated article object',
    '/api/articles/:article_id': 'DELETE - responds with an empty object',
    '/api/articles/:article_id/comments':
      'GET - responds with an array of comments for a given article',
    '/api/articles/:article_id/comments':
      'POST - accepts and responds with a posted comment object',
    '/api/articles/:article_id/comments/:comment_id':
      'PATCH - accepts and responds with updated comment object',
    '/api/articles/:article_id/comments/:comment_id':
      'DELETE - responds with an empty object',
    '/api/users': 'GET - responds with an array of user objects',
    '/api/users/:username': 'GET - responds with a user object',
  };
  res
    .status(200)
    .send({ endpoints })
    .catch(next);
};
