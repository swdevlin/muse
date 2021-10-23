"use strict"

const logger = require("../logger");
const knex = require('../db/connection');

const guildDelete = async guild => {
  try {
    const trx = await knex.transaction();
    let server = await trx('discord_server').select('id').where({discord_id: guild.id});
    if (server.length === 1) {
      server = server[0];
      server.id = parseInt(server.id);
      await trx('topic')
        .where({server_id: server.id})
        .delete();
      await trx('discord_server').delete().where({discord_id: guild.id});
    }
    await trx.commit();
    logger.info(`Removed from server ${guild.id}`);
  } catch(err) {
    logger.error(err);
  }
};

module.exports = guildDelete;
