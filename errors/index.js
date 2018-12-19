exports.handle400 = (err, req, res, next) => {
  const codes = {
    42703: 'invalid input',
    23502: 'violates not null violation',
    '22P02': 'invalid input syntax for type integer',
    23505: 'duplicate key value violates unique constraint',
  };
  if (err.status === 400) res.status(400).send({ msg: err.msg });
  else if (codes[err.code]) res.status(400).send({ msg: codes[err.code] });
  else next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ status: 405, msg: 'method not allowed' });
};

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23505: 'duplicate key value violates unique constraint',
  };
  if (codes[err.code]) res.status(422).send({ msg: codes[err.code] });
  else next(err);
};

exports.handle500 = (err, req, res, next) => {
  res.status(500).send({ status: 500, msg: 'server error' });
};
