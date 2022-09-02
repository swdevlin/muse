"use strict"

const logger = require("../logger");
const knex = require('../db/connection');

const guildDelete = async (guild) => {
  try {
    let channels = await knex('channel').select('id').where({guild_id: guild.id});
    for (const channel of channels) {
      await knex('channel_topic').delete().where({channel_id: channel.id});
      await knex('channel').delete().where({id: channel.id});
    }
    await knex('guild').delete().where({id: guild.id});
    logger.info(`Removed from server ${guild.id}`);
  } catch(err) {
    logger.error(err);
  }
};

module.exports = guildDelete;
