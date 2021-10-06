
exports.up = function(knex) {
  return knex.schema
    .createTable('discord_channel', function (table) {
      table.bigIncrements('id').notNullable().unique();
      table.bigInteger('server_id').notNullable();
      table.foreign('server_id').references('discord_server.id').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('discord_channel');
};
