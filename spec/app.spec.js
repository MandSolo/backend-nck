process.env.NODE_ENV = 'test';

const app = require('../app');
const connection = require('../db/connection');
const request = require('supertest')(app);
const { expect } = require('chai');

describe('/api', () => {
  beforeEach(() => {
    connection.migrate.rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run());
  });
  after(() => connection.destroy());
});

it('GET- returns status 404 if directed to an endpoint that does not exist', () => request
  .get('/api/notARealEndpoint')
  .expect(404)
  .then((res) => {
    expect(res.body.msg).to.equal('error page not found');
  }));
