const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Discord = require('discord.js');
const discordClient = new Discord.Client();

discordClient.login(process.env.DISCORD_TOKEN);

module.exports = discordClient;
