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
    .get('/notARealEndpoint')
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
    it('POST status: 201 accepts an object containing slug and description property, the slug must be unique and responds with the posted topic object', () => {
      const topic = { description: 'Code is love, code is life', slug: 'coding' };
      return request
        .post('/api/topics')
        .send(topic)
        .expect(201)
        .then((res) => {
          expect(res.body.topic.description).to.equal(topic.description);
          expect(res.body.topic.slug).to.equal(topic.slug);
        });
    });

    describe('/:topic/articles', () => {
      it('GET status: 200 returns an array of articles for a given topic with the correct keys', () => request
        .get('/api/topics/cats/articles').expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(1);
          expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic');
        }));
      // testing queries starts here!!!!!!!!!!!
      it('GET status: 200 and has a limit query of 1', () => request
        .get('/api/topics/cats/articles?limit=1')
        .expect(200)
        .then((res) => {
          expect(res.body.articles).to.have.length(1);
        }));
      it('GET status: 200 and sorts articles by any valid column', () => request
        .get('/api/topics/mitch/articles?maxResult&sort_by=title')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('A');
          expect(res.body.articles[9].title).to.equal('They\'re not exactly dogs, are they?');
        }));
    });
  });
});
