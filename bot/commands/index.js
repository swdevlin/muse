const fs = require('fs');

const commands = {};

const extensionRE = /\.js$/;

fs.readdirSync(__dirname + '/').forEach(function(file) {
  if (extensionRE.test(file) && file !== 'index.js') {
    const name = file.replace('.js', '');
    const handler = require('./' + name);
    commands[handler.command] = handler;
  }
});

module.exports = commands;

