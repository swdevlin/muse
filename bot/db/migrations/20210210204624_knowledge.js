
exports.up = function(knex) {
  return knex.schema
    .createTable('knowledge', function (table) {
      table.bigIncrements('id').notNullable().unique();
      table.text('title').notNullable().unique();
      table.text('text').notNullable();
      table.bigInteger('server_id').notNullable();
      table.foreign('server_id').references('discord_server.id').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('knowledge');
};
