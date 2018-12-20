process.env.NODE_ENV = 'test';
const app = require('../app');
const connection = require('../db/connection');
const request = require('supertest')(app);
const { expect } = require('chai');

// //////////////////////////////////////////////////////////////

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  it('GET status: 404 directed to an endpoint that does not exist', () => request
    .get('/notARealEndpoint')
    .expect(404)
    .then((res) => {
      expect(res.body.msg).to.equal('error page not found');
    }));

  // //////////////////////////////////////////////////////////////

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

    it('ALL status: 405 input method is not get or post', () => request
      .delete('/api/topics')
      .expect(405)
      .then((res) => {
        expect(res.body.msg).to.equal('method not allowed');
      }));

    // //////////////////////////////////////////////////////////////

    describe('/:topic/articles', () => {
      it('GET status: 200 returns an array of articles for a given topic with the correct keys', () => request
        .get('/api/topics/cats/articles').expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(1);
          expect(body.articles[0]).to.have.all.keys('author', 'title', 'article_id', 'votes', 'comment_count', 'created_at', 'topic');
        }));
      it('GET status: 200 has a limit query of 1', () => request
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
      it('GET status: 200 sorts articles by any valid column', () => request
        .get('/api/topics/mitch/articles?maxResult&sort_by=title')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Z');
          expect(res.body.articles[9].title).to.equal('Am I a cat?');
        }));
      it('GET status: 200 articles sorted by chosen column', () => request
        .get('/api/topics/mitch/articles?sort_by=author')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].author).to.equal('rogersop');
        }));
      it('GET status: 200 articles sorted by default of column created_at if invalid sort is given', () => request
        .get('/api/topics/mitch/articles?sort_by=charizard')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        }));
      it('GET status: 200 articles sorted by chosen column and order of sort', () => request
        .get('/api/topics/mitch/articles?sort_by=title&sort_ascending=true')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('A');
        }));
      it('GET status: 200 returns articles on a given page', () => request
        .get('/api/topics/mitch/articles?p=2')
        .expect(200)
        .then((res) => {
          expect(res.body.articles[0].title).to.equal('Moustache');
        }));
      it('GET status: 400 invalid syntax is used in the p query', () => request
        .get('/api/topics/cats/articles?p=kfc')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).to.equal('invalid input syntax for type integer');
        }));
      it('GET status: 404 given non existant topic', () => request
        .get('/api/topics/ronaldo')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).to.equal('error page not found');
        }));

      it('POST status: 201 accepts an object containing a title, body and username property and responds with the posted article', () => {
        const newPost = {
          title: 'united are the best',
          body: '20 times, 20 times, man united',
          username: 'butter_bridge',
        };
        return request
          .post('/api/topics/mitch/articles')
          .send(newPost)
          .expect(201)
          .then((res) => {
            expect(res.body.article.title).to.equal('united are the best');
            expect(res.body.article).to.haveOwnProperty('article_id');
            expect(res.body.article.article_id).to.equal(13);
          });
      });
    });
  });


  // //////////////////////////////////////////////////////////////

  describe('/articles', () => {
    it('GET status: 200 responds with an array of article objects with the correct keys and properties', () => request
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        expect(res.body.articles).to.be.an('array');
        expect(res.body.articles[0]).to.have.all.keys(
          'author',
          'article_id',
          'body',
          'title',
          'votes',
          'topic',
          'comment_count',
          'created_at',
        );
        expect(res.body.articles[0].topic).to.equal('mitch');
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
        expect(res.body.articles).to.have.length(10);
      }));
    it('GET status: 200 has a limit query of 1', () => request
      .get('/api/articles?limit=1')
      .expect(200).then((res) => {
        expect(res.body.articles).to.have.length(1);
      }));
    it('GET status: 400 invalid syntax is used in the limit query', () => request
      .get('/api/articles?limit=kfc')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));
    it('GET status: 200 sorts articles by any valid column', () => request
      .get('/api/articles?maxResult&sort_by=title')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Z');
        expect(res.body.articles[9].title).to.equal('Does Mitch predate civilisation?');
      }));
    it('GET status: 200 articles sorted by chosen column', () => request
      .get('/api/articles?sort_by=author')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].author).to.equal('rogersop');
      }));
    it('GET status: 200 articles sorted by default of column created_at if invalid sort is given', () => request
      .get('/api/articles?sort_by=charizard')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Living in the shadow of a great man');
      }));
    it('GET status: 200 articles sorted by chosen column and order of sort', () => request
      .get('/api/articles?sort_by=title&sort_ascending=true')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('A');
      }));
    it('GET status: 200 returns articles on a given page', () => request
      .get('/api/articles?p=2')
      .expect(200)
      .then((res) => {
        expect(res.body.articles[0].title).to.equal('Am I a cat?');
      }));
    it('GET status: 400 invalid syntax is used in the p query', () => request
      .get('/api/articles?p=kfc')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).to.equal('invalid input syntax for type integer');
      }));
    it('GET status: 404 given non existant article', () => request
      .get('/api/articles/ronaldo')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.equal('error page not found');
      }));

    // //////////////////////////////////////////////////////////////

    describe('/articles/:article_id', () => {
      it('GET status: 200 responds with an array of article objects', () => request
        .get('/api/articles/1')
        .expect(200)
        .then((res) => {
          expect(res.body.articles).to.be.an('array');
          expect(res.body.articles[0]).to.have.all.keys(
            'article_id',
            'author',
            'title',
            'votes',
            'topic',
            'body',
            'comment_count',
            'created_at',
          );
          expect(res.body.articles[0].topic).to.equal('mitch');
          expect(res.body.articles[0].body).to.equal('I find this existence challenging');
          expect(res.body.articles).to.have.length(1);
        }));
      it('GET status: 400 invalid syntax is used for article id', () => request
        .get('/api/articles/food')
        .expect(400)
        .then((res) => {
          expect(res.body.msg).to.equal('invalid input syntax for type integer');
        }));
      it('GET status: 404 if given non existant article id', () => request
        .get('/api/articles/197666')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).to.equal('error page not found');
        }));
      it('PATCH status: 202 takes an object and increases votes if postive integer given', () => request
        .patch('/api/articles/1')
        .send({ inc_votes: 20 })
        .expect(202)
        .then((res) => {
          expect(res.body.article.title).to.equal('Living in the shadow of a great man');
          expect(res.body.article.votes).to.equal(120);
        }));
      it.only('PATCH status: 202 takes an object and increases votes if postive integer given', () => request
        .patch('/api/articles/1')
        .send({ inc_votes: -20 })
        .expect(202)
        .then((res) => {
          expect(res.body.article.title).to.equal('Living in the shadow of a great man');
          expect(res.body.article.votes).to.equal(80);
        }));
    });
  });
});
