const logger = require("../logger");
const knex = require('../db/connection');
const {sendEntry, findEntry} = require("../helpers");
const Random = require("random-js").Random;
const rng = new Random();

class RandomTopic {
  static command = '-random';

  static async do(msg) {
    const {channel} = msg;
    const {guild} = channel;

    try {
      const items = await knex('topic')
        .join('discord_server', 'discord_server.id', 'topic.server_id')
        .where({discord_id: guild.id, custom: false})
        .count('topic.id as c');
      const r = rng.integer(0, items[0].c-1);
      const topic = await knex('topic')
        .select('key')
        .join('discord_server', 'discord_server.id', 'topic.server_id')
        .where({discord_id: guild.id})
        .limit(1)
        .offset(r).first();
      let entry = await findEntry(topic.key, guild.id);
      await sendEntry(msg, entry);
      logger.info(`${guild.id} ${msg.author.id} random`);
    } catch(err) {
      logger.error(err);
    }
  }
}

module.exports = RandomTopic;
