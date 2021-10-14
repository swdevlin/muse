
exports.up = function(knex) {
  return knex.schema
    .createTable('discord_server', function (table) {
      table.bigIncrements('id').notNullable().unique();
      table.string('discord_id', 80).notNullable().unique();
      table.string('name', 80).notNullable().unique();
    });
};

exports.down = function(knex) {
 };
