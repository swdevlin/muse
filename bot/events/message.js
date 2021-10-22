const client = require("../client");
const logger = require("../logger");
const {sendEntry, findEntry} = require("../helpers");
const refresh = require("../commands/refresh");
const randomTopic = require("../commands/random");
const knex = require('../db/connection');

const cache = require('../cache');

const queries = [
  'what is ',
  'what are ',
  'what is the definition of ',
  'definition of ',
  'definition ',
  'define ',
  'who are the ',
  'who is ',
  'who are ',
  'describe ',
  'look up ',
  'what about ',
  'tell me about ',
  'do you know about ',
  'what do you know about ',
];

const getPrefix = async (guild_id) => {
  const prefixKey = `${guild_id}:prefix`;
  let prefix = await cache.get(prefixKey);
  if (!prefix) {
    const recs = await knex('discord_server').select('prefix').where({discord_id: guild_id});
    if (recs.length === 1) {
      prefix = recs[0].prefix;
      await cache.set(prefixKey, prefix)
    } else
      prefix = process.env.MUSE_PREFIX;
  }
  return prefix;
}
const message = async (msg) => {
  // ignore our own messages
  if (`${msg.author.username}#${msg.author.discriminator}` === client.user.tag)
    return;

  const {id: author_id} = msg.author;
  const {channel} = msg;
  const {guild} = channel;

  let {content} = msg;
  content = content.trim();
  const tokens = content.split(' ');
  if (tokens < 2)
    return;
  const prefix= await getPrefix(guild.id);
  if (prefix !== tokens[0])
    return;

  if (tokens[1] === '-refresh') {
    return await refresh(msg);
  }

  if (tokens[1] === '-random') {
    return await randomTopic(msg);
  }

  try {
    tokens.shift();
    let lookup = tokens.join(' ').toLocaleLowerCase().trim();
    if (lookup.startsWith('please '))
      lookup = lookup.substr(7);

    for (let q of queries) {
      if (lookup.startsWith(q)) {
        lookup = lookup.substr(q.length);
        break;
      }
    }
    if (lookup.startsWith('the '))
      lookup = lookup.substr(4);
    if (lookup.startsWith('a '))
      lookup = lookup.substr(2);

    let entry = await findEntry(lookup, guild.id);
    if (entry) {
      await sendEntry(msg, entry);
    } else {
      const nos = lookup.replace(/s$/, "");
      entry = await findEntry(nos, guild.id);
      if (entry)
        await sendEntry(msg, entry);
      else {
        const pluss = lookup + 's';
        entry = await findEntry(pluss, guild.id);
        if (entry)
          await sendEntry(msg, entry);
        else
          await msg.reply(`no data found for ${lookup}`);
      }
    }
  } catch(err) {
    logger.error(err);
    await msg.reply(err);
  } finally {
    logger.info(`${guild.id} ${author_id} ${msg.content}`);
  }
}

module.exports = message;
