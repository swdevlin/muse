"use strict"

const fs = require('fs');

const personalities = {};

const extensionRE = /\.js$/;

fs.readdirSync(__dirname + '/').forEach(function(file) {
  if (extensionRE.test(file) && file !== 'index.js' && !file.endsWith('base.js')) {
    const name = file.replace('.js', '');
    const handler = require('./' + name);
    personalities[handler.id] = handler;
  }
});

module.exports = personalities;
