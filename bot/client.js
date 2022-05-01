"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const {Client, Intents} = require('discord.js');

const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: [
    'CHANNEL', // Required to receive DMs
  ]
});

discordClient.login(process.env.DISCORD_TOKEN);

module.exports = discordClient;
