"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {hackDetected} = require("../helpers");
const fs = require('fs')

class Diagnostics {
  static command = '-diagnostics';

  static async do(msg, personality_id) {
    const {channel} = msg;

    try {
      if (channel.permissionsFor(msg.member).has(Permissions.FLAGS.MANAGE_CHANNELS)) {
        const topics = await knex('topic')
          .where({personality: personality_id, alias_for: null})
          .count('topic.id as topic_count');

        const campaign = await knex('channel_topic')
          .join('channel', 'channel.id', 'channel_topic.channel_id')
          .where({'channel.id': channel.id, alias_for: null})
          .count('channel_topic.id as topic_count');

        const commandCount = fs.readdirSync('./commands').length - 1;

        const message = `running self diagnostics....\n\nI know ${topics[0].topic_count} common topics and ${campaign[0].topic_count} campaign topics and ${commandCount} commands`;
        logger.info(`diagnostics run for ${channel.id}`);
        await msg.reply(message);
      } else
        await hackDetected(msg);

    } catch(err) {
      logger.error(err);
    }
  }
}

module.exports = Diagnostics;
