"use strict"

const client = require("../client");
const logger = require("../logger");
// const dm = require("../dms");
const {addGuild, guildExists, addChannel, findChannel} = require("../helpers");
const knex = require('../db/connection');
const personalities = require("../personalities");

const message = async (msg) => {
  // ignore our own messages or messages from any bot
  if (`${msg.author.username}#${msg.author.discriminator}` === client.user.tag || msg.author.bot)
    return;

  const msgChannel = msg.channel;

  if (msgChannel.type === "DM") {
    // await dm(msg);
  } else {
    const {guild} = msgChannel;
    let channel;
    try {
      const trx = await knex.transaction();
      channel = await findChannel(msgChannel.id);
      if (!channel) {
        if (!await guildExists(guild.id))
          await addGuild(guild, trx);
        channel = await addChannel(guild.id, msgChannel, trx);

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
}

module.exports = message;
