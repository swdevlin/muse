"use strict"

const BasePersonality = require("./base");

class Traveller extends BasePersonality {
  static data = 'traveller';
  static textName = 'traveller';
  static id = 1;
  static defaultPrefix = 'library';

}

module.exports = Traveller;
