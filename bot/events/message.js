"use strict"

const client = require("../client");
const logger = require("../logger");
const {sendEntry, findEntry, addGuild, populateMuse, populateCampaign, guildExists} = require("../helpers");
const knex = require('../db/connection');
const commands = require("../commands");
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

const tokenSplit = /\s+/;

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

  if (!await guildExists(guild.id)) {
    try {
      const trx = await knex.transaction();
      const id = await addGuild(guild, trx);

      await populateMuse(id, trx);
      await populateCampaign(id, trx);

      await trx.commit();

      logger.info(`created guild ${guild.id} on muse lookup`);
    } catch(err) {
      if (err.message.includes('duplicate key value violates'))
        logger.warn(`server ${guild.id} already registered`);
      else
        logger.error(err);
    }
  }
  let {content} = msg;
  content = content.toLocaleLowerCase().trim();
  const tokens = content.split(tokenSplit);
  const prefix= await getPrefix(guild.id);
  if (prefix !== tokens[0])
    return;
  if (tokens.length === 1)
    tokens.push('help');

  if (commands[tokens[1]])
    return await commands[tokens[1]].do(msg);

  try {
    tokens.shift();
    let lookup = tokens.join(' ');
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

    if (lookup === 'help') {
      let entry = {
        title: 'Help',
        text: `Add text after \`${prefix}\` and I will look up information about the topic. For example, enter \`${prefix} c-ball\` to find out information about c-ball`
      }
      await sendEntry(msg, entry);
    } else {
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
    }
  } catch(err) {
    logger.error(err);
    await msg.reply(err);
  } finally {
    logger.info(`${guild.id} ${author_id} ${msg.content}`);
  }
}

module.exports = message;
