exports.handle400 = (err, req, res, next) => {
  const codes = {
    42703: 'invalid input',
    23502: 'violates not null violation',
    '22P02': 'invalid input syntax for type integer',
  };
  if (codes[err.code]) res.status(400).send({ msg: codes[err.code] });
  else next(err);
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ status: 405, msg: 'method not allowed' });
};
