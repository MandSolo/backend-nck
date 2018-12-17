
exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (topicsTable) => {
    topicsTable.string('slug').primary();
    topicsTable.unique('slug');
    topicsTable.string('description');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
