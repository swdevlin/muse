"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const discordClient = require("./client");
const ready = require("./events/ready");
const message = require("./events/message");
const guildBanAdd = require("./events/guild_ban_add");
const guildCreate = require("./events/guild_create");
const guildMemberRemove = require("./events/guild_member_remove");
const guildDelete = require("./events/guild_delete");
const guildBanRemove = require("./events/guild_ban_remove");

discordClient.on('ready', ready);
discordClient.on('messageCreate', message);
discordClient.on('guildBanAdd', guildBanAdd);
discordClient.on('guildBanRemove', guildBanRemove);
discordClient.on('guildCreate', guildCreate);
discordClient.on('guildMemberRemove', guildMemberRemove);
discordClient.on('guildDelete', guildDelete);
