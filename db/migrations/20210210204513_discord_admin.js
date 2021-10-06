
exports.up = function(knex) {
  return knex.schema
    .createTable('discord_admin', function (table) {
      table.bigIncrements('id').notNullable().unique();
      table.string('discord_id', 80).notNullable().unique();
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('discord_admin');
};
