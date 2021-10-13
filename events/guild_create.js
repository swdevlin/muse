const logger = require("../logger");
const muse = require("../muse");
const knex = require('../db/connection');

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

    // Populate muse data
    for (const topic of Object.keys(muse)) {
      await trx('topic').insert({
        title: topic,
        text: muse[topic].text,
        custom: false,
        modified: false,
        alias_for: muse[topic].references,
        server_id: id
      });
    }
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
