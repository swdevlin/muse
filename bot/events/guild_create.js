"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const {populateMuse, populateCampaign} = require("../helpers");

const guildCreate = async guild => {
  try {
    const trx = await knex.transaction();

    let id = await trx('discord_server').insert({
      discord_id: guild.id,
      name: guild.name,
      icon: guild.icon,
      owner_id: guild.ownerID,
      prefix: 'muse',
      joined_at: new Date()
    }).returning('id');
    id = parseInt(id);

    await populateMuse(id, trx);
    await populateCampaign(id, trx);

    await trx.commit();

    logger.info(`invited to server ${guild.id}`);
  } catch(err) {
    if (err.message.includes('duplicate key value violates'))
      logger.warn(`server ${guild.id} already registered`);
    else
      logger.error(err);
  }
};

module.exports = guildCreate;
