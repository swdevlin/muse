"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {hackDetected} = require("../helpers");

class Diagnostics {
  static command = '-diagnostics';

  static async do(msg) {
    const {guild} = msg.channel;

    try {
      if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        const diag = await knex('topic')
          .join('discord_server', 'discord_server.id', 'topic.server_id')
          .select('custom')
          .where({discord_id: guild.id})
          .count('topic.id as topic_count')
          .groupBy('custom');
        const message = `running self diagnostics....\n\nI know ${diag[0].topic_count} common topics and ${diag[1].topic_count} campaign topics`;
        logger.info(`diagnostics run for ${guild.id}`);
        await msg.reply(message);
      } else
        await hackDetected(msg);

    } catch(err) {
      logger.error(err);
    }
  }
}

module.exports = Diagnostics;
