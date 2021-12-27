"use strict"

const logger = require("./logger");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const knex = require("./db/connection");

const populateMuse = async (personality_id, data, trx) => {
  for (const topic of Object.keys(data)) {
    const entry = data[topic];
    await trx('topic').insert({
      title: entry.title,
      key: topic,
      text: entry.text,
      personality: personality_id,
      parent: entry.parent,
      wiki_slug: entry.wiki_slug,
      page: entry.page,
    }).onConflict(['personality', 'key']).merge();
    if (entry.aliases)
      for (const alias of entry.aliases) {
        await trx('topic').insert({
          title: entry.title,
          key: alias,
          alias_for: topic,
          personality: personality_id
        }).onConflict(['personality', 'key']).ignore();
    }
  }
}

const populateCampaign = async (server_id, trx) => {
  let file = fs.readFileSync( path.resolve(__dirname, 'campaign.yaml'), 'utf8');
  const campaign = YAML.parse(file);
  for (const topic of Object.keys(campaign)) {
    await trx('topic').insert({
      title: campaign[topic].title,
      key: topic,
      text: campaign[topic].text,
      custom: true,
      modified: false,
      wiki_slug: campaign[topic].wiki_slug,
      parent: campaign[topic].parent,
      page: campaign[topic].page,
      alias_for: campaign[topic].references,
      server_id: server_id
    }).onConflict(['server_id', 'key']).merge();
  }
}

const deleteCoreMuseEntries = async (discord_id, trx) => {
  const server_id = await getServerId(discord_id, trx);
  await trx('topic')
    .where({server_id: server_id, custom: false})
    .delete();
}

const deleteMuseEntries = async (discord_id, trx) => {
  const server_id = await getServerId(discord_id, trx);
  await trx('topic')
    .where({server_id: server_id})
    .delete();
}

const getServerId = async (discord_id, trx) => {
  const server = await trx('discord_server').select('id').where({discord_id: discord_id});
  if (server.length === 1) {
    return parseInt(server[0].id);
  } else
    return null;
}

const addGuild = async (guild, trx) => {
  let id = await trx('discord_server').insert({
    discord_id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner_id: guild.ownerID,
    joined_at: new Date()
  }).returning('id');
  return parseInt(id);
}

const addChannel = async (guild_id, channel, trx) => {
  const data = {
    channel_id: channel.id,
    server_id: guild_id,
    name: channel.name,
    prefix: 'muse',
  }
  let id = await trx('channel').insert(data).returning('id');
  data.id = parseInt(id);
  return data;
}

const sendEntry = async (msg, entry) => {
  let text;
  if (entry.page)
    text = `**${entry.title}**   :book: ${entry.page}\n${entry.text}`;
  else
    text = `**${entry.title}**\n${entry.text}`;
  if (entry.wiki_slug)
    text += `_ https://eclipsephase.github.io/${entry.wiki_slug} _`
  await msg.reply(text);
}

const hackDetected = async (msg) => {
  const text = 'infosec check failed';
  logger.info(`permissions fail - ${msg.guild.id} ${msg.author.id} ${msg.content}`);
  await msg.reply(text);
}

const reList = /[^$]\$list/;
const reListReplace = /([^$])\$list/gm;

const getChildren = async (topic, channel_id, personality_id) => {
  const topics = await knex.select('title')
    .from('channel_topic')
    .join('channel', 'channel.id', 'channel_topic.channel_id')
    .where({parent: topic, 'channel.channel_id': channel_id})
    .union([
      knex('topic')
        .select('title')
        .where({parent: topic, personality: personality_id})
    ])
    .orderBy('title');

  return topics.map(t => t.title).join(', ');
}

const findEntry = async (topic, channel_id, personality_id) => {
  const topics = await knex.select('title', 'text', 'alias_for', 'page', 'wiki_slug')
    .from('channel_topic')
    .join('channel', 'channel.id', 'channel_topic.channel_id')
    .where({key: topic, 'channel.channel_id': channel_id})
    .union([
      knex.select('title', 'text', 'alias_for', 'page', 'wiki_slug')
        .from('topic')
        .where({key: topic, personality: personality_id})
    ])
  ;

  if (topics.length > 0) {
    const entry = topics[0];
    if (entry.alias_for !== null) {
      return await findEntry(entry.alias_for, channel_id, personality_id);
    } else {
      if (entry.text.match(reList)) {
        const children = await getChildren(topic, channel_id, personality_id);
        entry.text = entry.text.replace(reListReplace, "$1" + children);
      }
      return entry;
    }
  } else
    return null;
}

const guildExists = async id => {
  const ret = await knex('discord_server').select('id').where({discord_id: id}).limit(1);
  return ret.length === 1 ? ret[0].id : null;
}

const findChannel = async id => {
  const ret = await knex('channel').where({channel_id: id}).limit(1);
  return ret.length === 1 ? ret[0] : null;
}

module.exports = {
  deleteCoreMuseEntries: deleteCoreMuseEntries,
  deleteMuseEntries: deleteMuseEntries,
  getServerId: getServerId,
  populateMuse: populateMuse,
  populateCampaign: populateCampaign,
  sendEntry: sendEntry,
  hackDetected: hackDetected,
  findEntry: findEntry,
  addGuild: addGuild,
  addChannel: addChannel,
  guildExists: guildExists,
  findChannel: findChannel,
}
