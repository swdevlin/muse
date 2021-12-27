"use strict"

const client = require("../client");
const logger = require("../logger");
const {sendEntry, findEntry, addGuild, populateMuse, populateCampaign, guildExists, addChannel, findChannel} = require("../helpers");
const knex = require('../db/connection');
const commands = require("../commands");
const cache = require('../cache');
const personalities = require("../personalities");

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

const message = async (msg) => {
  // ignore our own messages
  if (`${msg.author.username}#${msg.author.discriminator}` === client.user.tag)
    return;

  const {id: author_id} = msg.author;
  const msgChannel = msg.channel;
  const {guild} = msgChannel;

  let channel;
  let guildId;
  try {
    const trx = await knex.transaction();
    channel = await findChannel(msgChannel.id);
    if (!channel) {
      guildId = await guildExists(guild.id);
      if (!guildId)
        guildId = await addGuild(guild, trx);
      channel = await addChannel(guildId, msgChannel, trx);

      logger.info(`added channel ${msgChannel.id} to guild ${guild.id} on muse lookup`);
    }
    await trx.commit();

  } catch(err) {
    if (err.message.includes('duplicate key value violates'))
      logger.warn(`channel ${channel.id} or ${guild.id} already registered`);
    else
      logger.error(err);
  }

  const personality = channel.personality ? new personalities[channel.personality](channel.prefix) : new personalities[0](process.env.MUSE_PREFIX);
  await personality.handleMessage(msg);
}

module.exports = message;
