"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Client, GatewayIntentBits } = require('discord.js');

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    'CHANNEL', // Required to receive DMs
  ]
});

discordClient.login(process.env.DISCORD_TOKEN);

module.exports = discordClient;
