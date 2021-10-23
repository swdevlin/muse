"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const {Client, Intents} = require('discord.js');

const discordClient = new Client({ intents: [
  Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILDS,
] });

discordClient.login(process.env.DISCORD_TOKEN);

module.exports = discordClient;
