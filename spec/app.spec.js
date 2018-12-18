process.env.NODE_ENV = 'test';
const app = require('../app');
const connection = require('../db/connection');
const request = require('supertest')(app);
const { expect } = require('chai');

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));

  after(() => connection.destroy());

  it('GET status: 404 if directed to an endpoint that does not exist', () => request
    .get('/api/notARealEndpoint')
    .expect(404)
    .then((res) => {
      expect(res.body.msg).to.equal('error page not found');
    }));

  describe('/topics', () => {
    it('GET status: 200 responds with an array of topic objects with the correct keys and properties', () => request
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        expect(res.body.topics).to.be.an('array');
        expect(res.body.topics[0]).to.have.all.keys('slug', 'description');
        expect(res.body.topics[0].slug).to.equal('mitch');
        expect(res.body.topics).to.have.length(2);
      }));
  });
});
