
exports.up = function(knex) {
  return knex.schema
    .createTable('channel', function (table) {
      table.text('id').notNullable().unique();
      table.text('guild_id').notNullable();
      table.text('prefix').notNullable();
      table.text('wiki_url');
      table.integer('personality');
      table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('channel');
};
