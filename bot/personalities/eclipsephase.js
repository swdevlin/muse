"use strict"

const BasePersonality = require("./base");

class EclipsePhase extends BasePersonality {
  static data = 'eclipsephase';
  static textName = 'eclipsephase';
  static title = 'Eclipse Phase';
  static id = 2;
  static defaultPrefix = 'muse';
  static wikiBase = 'https://eclipsephase.github.io';

}

module.exports = EclipsePhase;
