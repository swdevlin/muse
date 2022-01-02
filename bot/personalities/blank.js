"use strict"

const BasePersonality = require("./base");

class BlankCanvas extends BasePersonality {
  static data = 'blank';
  static textName = 'blank';
  static title = 'Blank Canvas';
  static id = 4;
  static defaultPrefix = 'muse';
}

module.exports = BlankCanvas;
