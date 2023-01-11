exports.up = function(knex) {
  return knex.schema.table('channel_topic', table => {
    table.boolean('is_private').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('channel_topic', table => {
    table.dropColumn('is_private');
  });
};
