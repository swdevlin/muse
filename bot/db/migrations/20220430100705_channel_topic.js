
exports.up = function(knex) {
  return knex.schema
    .createTable('channel_topic', function (table) {
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
      table.text('channel_id');
      table.timestamps(true, true);
      table.unique(['channel_id', 'key'], 'idx_channel_topic');
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('channel_topic');
};
