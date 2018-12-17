
exports.up = function (knex, Promise) {
  return knex.schema.createTable('comments', (commentsTable) => {
    commentsTable.increments('comment_id').primary();
    commentsTable.string('username').references('users.username');
    commentsTable.integer('article_id').references('articles.article_id');
    commentsTable.integer('votes').defaultsTo(0);
    commentsTable.timestamp('created_at').defaultTo(knex.fn.now());
    commentsTable.string('body');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comments');
};
