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
