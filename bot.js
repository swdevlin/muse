const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const discordClient = require("./client");
const ready = require("./events/ready");
const message = require("./events/message");

discordClient.on('ready', ready);
discordClient.on('message', message);
