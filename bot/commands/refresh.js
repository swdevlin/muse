const logger = require("../logger");
const knex = require('../db/connection');
const {populateMuse, getServerId, deleteCoreMuseEntries} = require("../helpers");

const refresh = async (msg) => {
  const {content, channel} = msg;
  const {guild} = channel;
  if (content.endsWith('-refresh confirm')) {
    try {
      const trx = await knex.transaction();
      const id = await getServerId(guild.id, trx);
      await deleteCoreMuseEntries(guild.id, trx);
      await populateMuse(id, trx);
      await trx.commit();

      logger.info(`core muse entries updated for ${guild.id}`);
      await msg.reply('Core muse entries have been updated.')
    } catch(err) {
        logger.error(err);
    }
  } else {
    await msg.reply('The -refresh command will refresh all core muse entries. Any custom muse entries will not be modified.')
  }
};

module.exports = refresh;
