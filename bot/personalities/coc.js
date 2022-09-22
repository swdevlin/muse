"use strict"

const BasePersonality = require("./base");

class CoC extends BasePersonality {
  static data = 'coc';
  static textName = 'coc';
  static title = 'Call of Cthulhu';
  static id = 7;
  static defaultPrefix = 'muse';
  static webAbout = `
    <p>Muse references the 7th edition of Call of Cthulhu rules.</p>
  `;

}

module.exports = CoC;
