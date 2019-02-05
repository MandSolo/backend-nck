exports.getEndpointsJSON = (req, res, next) => {
  const endpoints = {
    '/api': 'GET',
    '/api/topics': 'GET & POST',
    '/api/topics/:topic/articles': 'GET & POST',
    '/api/articles': 'GET',
    '/api/articles/:article_id': 'GET & PATCH & DELETE',
    '/api/articles/:article_id/comments': 'GET & POST',
    '/api/articles/:article_id/comments/:comment_id': 'PATCH & DELETE',
    '/api/users': 'GET',
    '/api/users/:username': 'GET',
  };
  res.status(200).send({ endpoints })
    .catch(next);
};
