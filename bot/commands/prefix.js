"use strict"
const cache = require("../cache");
const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {hackDetected} = require("../helpers");

class Prefix {
  static command = '-prefix';

  static async do(msg) {
    const {channel} = msg;
    let {content} = msg;
    const {guild} = channel;

    content = content.trim();
    const tokens = content.split(' ');

    if (tokens.length === 4 && tokens[3] === 'confirm') {
      const [oldPrefix, command, newPrefix, confirmation] = tokens;
      try {
        if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
          await knex('discord_server').update({prefix: newPrefix}).where({discord_id: guild.id});
          await cache.set(`${guild.id}:prefix`, newPrefix);

          logger.info(`prefix changed to ${newPrefix} for ${guild.id}`);
          await msg.reply(`Muse prefix is now ${newPrefix}`)
        } else
          await hackDetected(msg);

      } catch(err) {
        logger.error(err);
      }
    } else {
      await msg.reply('The -prefix command will change the text Muse uses to look for posts to respond to. Use -prefix newprefix confirm')
    }
  }
}

module.exports = Prefix;
