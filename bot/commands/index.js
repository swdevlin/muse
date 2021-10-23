"use strict"

const fs = require('fs');
const logger = require("../logger");

const commands = {};

const extensionRE = /\.js$/;

fs.readdirSync(__dirname + '/').forEach(function(file) {
  if (extensionRE.test(file) && file !== 'index.js') {
    const name = file.replace('.js', '');
    const handler = require('./' + name);
    commands[handler.command] = handler;
  }
});

class Commands {
  static command = '-commands';

  static async do(msg) {
    const {guild} = msg.channel;
    const listOfCommands = Object.keys(commands).map(c => c).join(', ');

    const text = 'I know the following commands: ' + listOfCommands;
    await msg.reply(text);
    logger.info(`command list for ${guild.id} ${msg.author.id}`);
  }
}

commands[Commands.command] = Commands;

module.exports = commands;
