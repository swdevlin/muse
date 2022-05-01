
exports.up = function(knex) {
  return knex.schema
    .createTable('topic', function (table) {
      table.bigIncrements('id').notNullable().unique();
      table.text('key').notNullable();
      table.text('title').notNullable();
      table.text('text');
      table.text('alias_for');
      table.text('parent');
      table.text('page');
      table.text('wiki_slug');
      table.text('category');
      table.text('image');
      table.integer('personality');
      table.timestamps(true, true);
      table.unique(['personality', 'key'], 'idx_personality_topic');
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('topic');
};
