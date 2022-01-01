"use strict"
const logger = require("../logger");
const knex = require('../db/connection');
const { Permissions } = require('discord.js');
const {hackDetected} = require("../helpers");

class Persona {
  static command = '-persona';

  static async do(msg) {
    const {channel} = msg;
    let {content} = msg;

    content = content.trim();
    const tokens = content.split(' ');

    if (tokens.length === 4 && tokens[3] === 'confirm') {
      const newPersonality = tokens[2];
      try {
        if (channel.permissionsFor(msg.member).has(Permissions.FLAGS.MANAGE_CHANNELS)) {
          const personalities = require("../personalities");
          for (const k of Object.keys(personalities)) {
            const p = personalities[k];
            if (p.textName === newPersonality) {
              await knex('channel').update({personality: p.id, prefix: p.defaultPrefix}).where({channel_id: channel.id});
              logger.info(`persona changed to ${p.textName} for ${channel.id}`);
              return await msg.reply(`My persona has been changed to ${p.textName}; I respond to ${p.defaultPrefix}`)
            }
          }
          return await msg.reply(`Muse cannot adopt the ${newPersonality} persona`)
        } else
          await hackDetected(msg);

      } catch(err) {
        logger.error(err);
      }
    } else {
      let content = `The \`-persona\` command will change the base source of data for OpenMuse.
        Use \`${Persona.command} newpersonality confirm\` to change Muse's persona.`
      ;
      await msg.reply(content);
    }
  }
}

module.exports = Persona;
