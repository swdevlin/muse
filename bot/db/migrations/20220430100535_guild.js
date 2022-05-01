
exports.up = function(knex) {
  return knex.schema
    .createTable('guild', function (table) {
      table.text('id').notNullable().unique();
      table.timestamps(true, true);
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('guild');
};
