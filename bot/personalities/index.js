"use strict"

const fs = require('fs');
const logger = require("../logger");
const BasePersonality = require("./base");

const personalities = {};

const extensionRE = /\.js$/;

fs.readdirSync(__dirname + '/').forEach(function(file) {
  if (extensionRE.test(file) && file !== 'index.js' && file !== 'base.js') {
    const name = file.replace('.js', '');
    const handler = require('./' + name);
    personalities[handler.id] = handler;
  }
});

class Blank extends BasePersonality {
  static data = 'blank';
  static id = 0;

}

personalities[0] = Blank;


module.exports = personalities;
