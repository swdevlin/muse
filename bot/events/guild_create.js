"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const {populateMuse, populateCampaign, addGuild} = require("../helpers");

const guildCreate = async guild => {
  try {
    const trx = await knex.transaction();
    const id = await addGuild(guild, trx);

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
