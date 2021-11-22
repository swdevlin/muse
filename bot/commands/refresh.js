"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {populateMuse, getServerId, deleteCoreMuseEntries, hackDetected, populateCampaign} = require("../helpers");

class Refresh {
  static command = '-refresh';

  static async do(msg) {
    const {content, channel} = msg;
    const {guild} = channel;

    if (content.endsWith('-refresh confirm')) {
      try {
        if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          const trx = await knex.transaction();
          const id = await getServerId(guild.id, trx);
          await deleteCoreMuseEntries(guild.id, trx);
          await populateMuse(id, trx);
          await trx.commit();

          logger.info(`core muse entries updated for ${guild.id}`);
          await msg.reply('My core knowledge base has been refreshed.')
        } else
          await hackDetected(msg);

      } catch (err) {
        logger.error(err);
      }
    } else if (content.endsWith('-refresh campaign confirm')) {
      try {
        if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          const trx = await knex.transaction();
          const id = await getServerId(guild.id, trx);
          await populateCampaign(id, trx);
          await trx.commit();

          logger.info(`campaign muse entries updated for ${guild.id}`);
          await msg.reply('My campaign knowledge base bas been refreshed.')
        } else
          await hackDetected(msg);

      } catch(err) {
        logger.error(err);
      }
    } else {
      await msg.reply('The -refresh command will refresh all core muse entries. Any custom muse entries will not be modified.')
    }
  }
}

module.exports = Refresh;
