"use strict"

const BasePersonality = require("./base");

class EclipsePhase extends BasePersonality {
  static data = 'eclipsephase';
  static textName = 'eclipsephase';
  static title = 'Eclipse Phase';
  static id = 2;
  static defaultPrefix = 'muse';

}

module.exports = EclipsePhase;
