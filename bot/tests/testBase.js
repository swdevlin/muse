"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const chai = require('chai');
chai.should();
const BasePersonality = require("../personalities/base");

describe('Test Base Persona', function () {
  it('keys from yaml converted to lower case', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'sample.yaml');
    const persona = new BasePersonality('p');
    const y = await persona.loadYAMLFile(yamlFile)
    console.log(y);
    y.should.not.have.property('Convert to Lower')
    y.should.have.property('convert to lower')
  });

  it('keys with accents are converted to lower case', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'sample.yaml');
    const persona = new BasePersonality('p');
    const y = await persona.loadYAMLFile(yamlFile)
    console.log(y);
    y.should.not.have.property('AccÉnt test')
    y.should.have.property('accént test')
  });

});
