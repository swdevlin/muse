const client = require("../client");
const logger = require("../logger");
const knex = require('../db/connection');
const {sendEntry} = require("../helpers");
const refresh = require("../commands/refresh");

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

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

const reList = /[^$]\$list/;
const reListReplace = /([^$])\$list/gm;

const getChildren = async (topic, discord_id) => {
  const topics = await knex('topic')
    .select('title')
    .join('discord_server', 'discord_server.id', 'topic.server_id')
    .where({parent: topic, discord_id: discord_id});
  return topics.map(t => t.title).join(', ');
}

const findEntry = async (topic, server_id) => {
  const topics = await knex('topic')
    .select('title', 'text', 'alias_for', 'page')
    .join('discord_server', 'discord_server.id', 'topic.server_id')
    .where({key: topic, discord_id: server_id});
  if (topics.length === 1) {
    const entry = topics[0];
    if (entry.alias_for !== null) {
      return await findEntry(entry.alias_for, server_id);
    } else {
      if (entry.text.match(reList)) {
        const children = await getChildren(topic, server_id);
        entry.text = entry.text.replace(reListReplace, "$1" + children);
      }
      return entry;
    }
  } else
    return null;
}

const message = async (msg) => {
  // ignore our own messages
  if (`${msg.author.username}#${msg.author.discriminator}` === client.user.tag)
    return;

  let {content} = msg;
  content = content.trim();
  const tokens = content.split(' ');
  if (tokens < 2)
    return;
  if (!muse_prefix.startsWith(tokens[0]))
    return;

  if (tokens[1] === '-refresh') {
    return await refresh(msg);
  }

  const {id: author_id} = msg.author;
  const {channel} = msg;
  const {guild} = channel;
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
