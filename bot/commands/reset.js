"use strict"
const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {hackDetected} = require("../helpers");

class Reset {
  static command = '-reset';

  static async do(msg) {
    const {channel} = msg;
    let {content} = msg;

    content = content.trim();
    const tokens = content.split(' ');

    if (tokens.length === 3 && tokens[2] === 'confirm') {
      try {
        if (channel.permissionsFor(msg.member).has(Permissions.FLAGS.MANAGE_CHANNELS)) {
          await knex('channel_topic').delete().where({channel_id: channel.id});
          logger.info(`campaign entries deleted for ${channel.id}`);
          return await msg.reply(`Campaign entries have been deleted.`)
        } else
          await hackDetected(msg);

      } catch(err) {
        logger.error(err);
      }
    } else {
      let content = `The \`-reset\` command remove all campaign entries from the channel.`;
      await msg.reply(content);
    }
  }
}

module.exports = Reset;
