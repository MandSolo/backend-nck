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
    it('POST status: 400 input provided is invalid', () => request
      .post('/api/topics')
      .send({ starbucks: 'toffee nut latte' })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input');
      }));
    it('POST status: 422 input provided is a non-unique slug', () => {
      const topic = {
        description: 'The man, the Mitch, the legend',
        slug: 'mitch',
      };
      return request
        .post('/api/topics')
        .send(topic)
        .expect(422)
        .then((res) => {
          expect(res.body.msg).to.equal('duplicate key value violates unique constraint');
        });
    });
    it('ALL status: 405 if input method that is not get or post', () => request
      .delete('/api/topics')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method not allowed');
      }));

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
      it('GET status: 400 invalid syntax is used in the limit query', () => request
        .get('/api/topics/cats/articles?limit=kfc')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).to.equal('invalid input syntax for type integer');
        }));
      it('GET status: 200 and sorts articles by any valid column', () => request
        .get('/api/topics/mitch/articles?maxResult&sort_by=title')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('A');
          expect(res.body.articles[9].title).to.equal('They\'re not exactly dogs, are they?');
        }));
      it('GET status: 200 articles sorted by chosen column', () => request
        .get('/api/topics/mitch/articles?sort_by=author')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].author).to.equal('butter_bridge');
        }));
      it('GET status: 200 200 articles sorted by default of column created_at if invalid sort is given', () => request
        .get('/api/topics/mitch/articles?sort_by=charizard')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Moustache');
        }));
    });
  });
});
