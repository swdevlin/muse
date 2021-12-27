"use strict"

const logger = require("../logger");
const knex = require('../db/connection');
const {sendEntry, findEntry} = require("../helpers");
const Random = require("random-js").Random;
const rng = new Random();

class RandomTopic {
  static command = '-random';

  static async do(msg, personality_id) {
    const {channel} = msg;

    try {
      const items = await knex.select('key')
        .from('channel_topic')
        .join('channel', 'channel.id', 'channel_topic.channel_id')
        .where({'channel.channel_id': channel.id})
        .union([
          knex.select('key')
            .from('topic')
            .where({personality: personality_id})
        ])
      ;

      const r = rng.integer(0, items.length-1);
      let entry = await findEntry(items[r].key, channel.id, personality_id);
      await sendEntry(msg, entry);
      logger.info(`${channel.id} ${msg.author.id} random`);
    } catch(err) {
      logger.error(err);
    }
  }
}

module.exports = RandomTopic;
