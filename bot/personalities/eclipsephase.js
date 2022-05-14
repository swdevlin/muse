"use strict"

const BasePersonality = require("./base");

class EclipsePhase extends BasePersonality {
  static data = 'eclipsephase';
  static textName = 'eclipsephase';
  static title = 'Eclipse Phase';
  static id = 2;
  static defaultPrefix = 'muse';
  static wikiBase = 'https://eclipsephase.github.io';
  static webAbout = `
    <p>Knowledge in the Eclipse Phase persona is from the 2nd edition of the game.</p>
  `;

}

module.exports = EclipsePhase;
