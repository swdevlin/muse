"use strict"

const logger = require("./logger");
const knex = require("./db/connection");
const {EmbedBuilder, MessageEmbed} = require("discord.js");

const populateMuse = async (personality_id, data, trx) => {
  for (const topic of Object.keys(data)) {
    const entry = data[topic];
    await trx('topic').insert({
      title: topic,
      key: topic.toLocaleLowerCase(),
      text: entry.text,
      personality: personality_id,
      parent: entry.parent ? entry.parent.toLocaleLowerCase() : null,
      image: entry.image,
      wiki_slug: entry.wiki_slug,
      page: entry.page,
    }).onConflict(['personality', 'key']).merge();
    const normalized = topic.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized !== topic) {
      if (!entry.aliases)
        entry.aliases = [];
      entry.aliases.push(normalized);
    }
    if (entry.aliases)
      for (const alias of entry.aliases) {
        await trx('topic').insert({
          title: alias,
          key: alias.toLocaleLowerCase(),
          alias_for: topic.toLocaleLowerCase(),
          personality: personality_id
        }).onConflict(['personality', 'key']).ignore();
    }
  }
}

const addGuild = async (guild, trx) => {
  await trx('guild').insert({
    id: guild.id,
  });
}

const addChannel = async (guild_id, channel, trx) => {
  const data = {
    id: channel.id,
    guild_id: guild_id,
    prefix: 'muse',
  }
  await trx('channel').insert(data);
  return data;
}

const sendEntry = async (interaction, entry, personality) => {
  try {
    let text;
    if (entry.page)
      text = `**${entry.title}**   :book: ${entry.page}\n${entry.text}`;
    else
      text = `**${entry.title}**\n${entry.text}`;
    if (entry.wiki_slug)
      text += `_ ${personality.constructor.wikiBase}/${entry.wiki_slug} _`;
    let embed = null;
    if (entry.image)
      embed = new EmbedBuilder().setImage(entry.image);
    const messagePayload = {
      content: text,
      embeds: embed ? [embed] : []
    };
    await interaction.reply(messagePayload);
  } catch(err) {
    logger.error(err);
  }
}

const hackDetected = async (interaction) => {
  const text = 'infosec check failed';
  logger.info(`permissions fail - ${interaction.guild.id} ${interaction.user.id}`);
  await interaction.reply(text);
}

const reList = /[^$]\$list/;
const reListReplace = /([^$])\$list/gm;

const getChildren = async (topic, channel_id, personality_id) => {
  const topics = await knex.select('title')
    .from('channel_topic')
    .join('channel', 'channel.id', 'channel_topic.channel_id')
    .where({parent: topic, 'channel.id': channel_id})
    .union([
      knex('topic')
        .select('title')
        .where({parent: topic, personality: personality_id})
    ])
    .orderBy('title');

  return topics.map(t => t.title).join(', ');
}

const findEntryInDB = async (topic, channel_id, personality_id) => {
  const topics = await knex.select('title', 'text', 'alias_for', 'page', 'wiki_slug', 'image')
    .from('channel_topic')
    .join('channel', 'channel.id', 'channel_topic.channel_id')
    .where({key: topic, 'channel.id': channel_id})
    .union([
      knex.select('title', 'text', 'alias_for', 'page', 'wiki_slug', 'image')
        .from('topic')
        .where({key: topic, personality: personality_id})
    ])
  ;

  if (topics.length > 0) {
    const entry = topics[0];
    if (entry.alias_for !== null) {
      return await findEntryInDB(entry.alias_for, channel_id, personality_id);
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
  const ret = await knex('guild').select('id').where({id: id}).limit(1);
  return ret.length === 1;
}

const findChannel = async id => {
  const ret = await knex('channel').where({id: id}).limit(1);
  return ret.length === 1 ? ret[0] : null;
}

module.exports = {
  populateMuse: populateMuse,
  sendEntry: sendEntry,
  hackDetected: hackDetected,
  findEntryInDB: findEntryInDB,
  addGuild: addGuild,
  addChannel: addChannel,
  guildExists: guildExists,
  findChannel: findChannel,
}
