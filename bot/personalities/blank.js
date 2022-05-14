"use strict"

const BasePersonality = require("./base");

class BlankCanvas extends BasePersonality {
  static data = 'blank';
  static textName = 'blank';
  static title = 'Blank Canvas';
  static id = 4;
  static defaultPrefix = 'muse';
  static webAbout = `
    <p>Use this persona if you don't want any default knowledge in Muse.</p>
    <p>Blank Canvas is also the persona to use when you are running a game not
     covered by Muse. We do accept pull requests.</p>
  `;

}

module.exports = BlankCanvas;
