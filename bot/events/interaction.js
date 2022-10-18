"use strict"

const client = require("../client");
const logger = require("../logger");
// const dm = require("../dms");
const {addGuild, guildExists, addChannel, findChannel} = require("../helpers");
const knex = require('../db/connection');
const personalities = require("../personalities");

const handler = async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton())
    return;

  // await interaction.deferReply();
  const msgChannel = interaction.channel;
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

  const personality = channel.personality ? new personalities[channel.personality](process.env.MUSE_PREFIX) : new personalities[4](process.env.MUSE_PREFIX);
  if (interaction.isButton())
    await personality.handleButton(interaction);
  else
    await personality.handleInteraction(interaction);
}

module.exports = handler;
