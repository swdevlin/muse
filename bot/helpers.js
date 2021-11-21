"use strict"

const muse = require("./muse");
const logger = require("./logger");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");
const knex = require("./db/connection");

const populateMuse = async (server_id, trx) => {
  for (const topic of Object.keys(muse)) {
    await trx('topic').insert({
      title: muse[topic].title,
      key: topic,
      text: muse[topic].text,
      custom: false,
      modified: false,
      parent: muse[topic].parent,
      wiki_slug: muse[topic].wiki_slug,
      page: muse[topic].page,
      alias_for: muse[topic].references,
      server_id: server_id
    }).onConflict(['server_id', 'key']).merge();
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
    prefix: 'muse',
    joined_at: new Date()
  }).returning('id');
  return parseInt(id);
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

const getChildren = async (topic, discord_id) => {
  const topics = await knex('topic')
    .select('title')
    .join('discord_server', 'discord_server.id', 'topic.server_id')
    .where({parent: topic, discord_id: discord_id})
    .orderBy('title');
  return topics.map(t => t.title).join(', ');
}

const findEntry = async (topic, server_id) => {
  const topics = await knex('topic')
    .select('title', 'text', 'alias_for', 'page', 'wiki_slug')
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

const guildExists = async id => {
  const ret = await knex('discord_server').select('id').where({discord_id: id}).limit(1);
  return ret.length === 1;
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
  guildExists: guildExists,
}
