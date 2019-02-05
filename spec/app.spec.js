/*  eslint "max-len": 0 */

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
  it('GET status: 200 serves a JSON object describing all the available endpoints on the API', () => request
    .get('/api')
    .expect(200)
    .then((res) => {
      expect(Object.keys(res.body.endpoints)).to.have.length(9);
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
      .get('/api/articles/1000')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).to.equal('error page not found');
      }));

    // //////////////////////////////////////////////////////////////

    describe('/articles/:article_id', () => {
      it('GET status: 200 responds with an array of article objects with the correct keys and properties', () => request
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
      it('PATCH status: 202 takes an object and decreases votes if negative integer given', () => request
        .patch('/api/articles/1')
        .send({ inc_votes: -20 })
        .expect(202)
        .then((res) => {
          expect(res.body.article.title).to.equal('Living in the shadow of a great man');
          expect(res.body.article.votes).to.equal(80);
        }));
      it('DELETE status 204: removes given article by article id', () => request
        .delete('/api/articles/1')
        .expect(204)
        .then((res) => {
          expect(res.body).to.eql({});
        }));
      it('ALL status: 405 input method is not get, patch or delete', () => request
        .post('/api/articles/1')
        .send({ name: 'mand' })
        .expect(405)
        .then((res) => {
          expect(res.body.msg).to.equal('method not allowed');
        }));

      // //////////////////////////////////////////////////////////////

      describe('/articles/:article_id/comments', () => {
        it('GET status: 200 responds with an array of comment objects with the correct keys and properties', () => request
          .get('/api/articles/1/comments')
          .expect(200)
          .then((res) => {
            expect(res.body.comments).to.be.an('array');
            expect(res.body.comments[0]).to.have.all.keys(
              'comment_id',
              'author',
              'votes',
              'created_at',
              'body',
            );
            expect(res.body.comments[0].author).to.equal('butter_bridge');
            expect(res.body.comments[0].body).to.equal('The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.');
          }));
        it('GET status: 200 has a limit query of 1', () => request
          .get('/api/articles/1/comments?limit=1')
          .expect(200).then((res) => {
            expect(res.body.comments).to.have.length(1);
          }));
        it('GET status: 400 invalid syntax is used in the limit query', () => request
          .get('/api/articles/1/comments?limit=kfc')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('invalid input syntax for type integer');
          }));
        it('GET status: 200 articles sorted by chosen column', () => request
          .get('/api/articles/1/comments?sort_by=comment_id')
          .expect(200)
          .then((res) => {
            expect(res.body.comments[0].comment_id).to.equal(2);
          }));
        it('GET status: 200 articles sorted by default of column created_at if invalid sort is given', () => request
          .get('/api/articles/1/comments?sort_by=charizard')
          .expect(200)
          .then((res) => {
            expect(res.body.comments[0].comment_id).to.equal(2);
          }));
        it('GET status: 200 articles sorted by chosen column and order of sort', () => request
          .get('/api/articles/1/comments?sort_ascending=true')
          .expect(200)
          .then((res) => {
            expect(res.body.comments[0].comment_id).to.equal(18);
          }));
        it('GET status: 200 returns articles on a given page', () => request
          .get('/api/articles/1/comments?p=2')
          .expect(200)
          .then((res) => {
            expect(res.body.comments[0].comment_id).to.equal(12);
          }));
        it('GET status: 400 invalid syntax is used in the p query', () => request
          .get('/api/articles/1/comments?p=kfc')
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('invalid input syntax for type integer');
          }));
        it('POST status: 201 returns an object with the posted comment', () => {
          const newPost = {
            body: 'my first comment',
            username: 'butter_bridge',
          };
          return request
            .post('/api/articles/9/comments')
            .expect(201)
            .send(newPost)
            .then((res) => {
              expect(res.body.comment.username).to.eql('butter_bridge');
              expect(res.body.comment.body).to.eql('my first comment');
            });
        });

        // //////////////////////////////////////////////////////////////

        describe('/articles/:article_id/comments/:comment_id', () => {
          it('PATCH status: 202 takes an object and increases comment votes if postive integer given', () => request
            .patch('/api/articles/1/comments/2')
            .send({ inc_votes: 5 })
            .expect(202)
            .then((res) => {
              expect(res.body.commentVotes[0].comment_id).to.equal(2);
              expect(res.body.commentVotes[0].votes).to.equal(19);
            }));
          it('PATCH status: 202 takes an object and decreases comment votes if negative integer given', () => request
            .patch('/api/articles/1/comments/2')
            .send({ inc_votes: -5 })
            .expect(202)
            .then((res) => {
              expect(res.body.commentVotes[0].comment_id).to.equal(2);
              expect(res.body.commentVotes[0].votes).to.equal(9);
            }));
          it('DELETE status 204: removes given article by article id', () => request
            .delete('/api/articles/1/comments/2')
            .expect(204)
            .then((res) => {
              expect(res.body).to.eql({});
            }));
          it('ALL status: 405 input method is not get, patch or delete', () => request
            .post('/api/articles/1/comments/2')
            .send({ name: 'mand' })
            .expect(405)
            .then((res) => {
              expect(res.body.msg).to.equal('method not allowed');
            }));
        });
      });
    });

    // //////////////////////////////////////////////////////////////

    describe('/users', () => {
      it('GET status: 200 responds with an array of user objects with the correct keys and properties', () => request
        .get('/api/users')
        .expect(200)
        .then((res) => {
          expect(res.body.users).to.be.an('array');
          expect(res.body.users[0]).to.have.all.keys(
            'username',
            'avatar_url',
            'name',
          );
          expect(res.body.users[1].username).to.equal('icellusedkars');
          expect(res.body.users[2].name).to.equal('paul');
          expect(res.body.users).to.have.length(3);
        }));

      it('ALL status: 405 input method is not get or post', () => request
        .delete('/api/users')
        .expect(405)
        .then((res) => {
          expect(res.body.msg).to.equal('method not allowed');
        }));

      // //////////////////////////////////////////////////////////////

      describe('/users/:username', () => {
        it('GET status: 200 responds with an array of user objects with the correct keys and properties', () => {
          const userObj = {
            username: 'butter_bridge',
            avatar_url: 'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg',
            name: 'jonny',
          };
          return request
            .get('/api/users/butter_bridge')
            .expect(200)
            .then((res) => {
              expect(res.body.user).to.eql(userObj);
            });
        });
        it('GET status: 404 input username does not exist', () => request
          .get('/api/users/starmanda')
          .expect(404)
          .then((res) => {
            expect(res.body.msg).to.equal('error page not found');
          }));
      });
    });
  });
});
