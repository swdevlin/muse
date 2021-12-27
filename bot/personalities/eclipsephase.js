"use strict"

const BasePersonality = require("./base");
const commands = require("../commands");
const {sendEntry, findEntry} = require("../helpers");

class EclipsePhase extends BasePersonality {
  static data = 'eclipsephase';
  static textName = 'eclipsephase';
  static id = 2;
  static defaultPrefix = 'muse';

}

module.exports = EclipsePhase;
