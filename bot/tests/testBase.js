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
    y.should.not.have.property('Convert to Lower')
    y.should.have.property('convert to lower')
  });

  it('keys with accents are converted to lower case', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'sample.yaml');
    const persona = new BasePersonality('p');
    const y = await persona.loadYAMLFile(yamlFile)
    y.should.not.have.property('AccÉnt test')
    y.should.have.property('accént test')
  });

  it('keys are stripped of punctuation', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'sample.yaml');
    const persona = new BasePersonality('p');
    const y = await persona.loadYAMLFile(yamlFile)
    y.should.not.have.property('Got ~`1234567890-=_+][{}\\"\'|,./?><no punctuation')
    y.should.have.property('got no punctuation')
  });

  it('keys have no extra spaces', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'sample.yaml');
    const persona = new BasePersonality('p');
    const y = await persona.loadYAMLFile(yamlFile)
    y.should.have.property('extra spaces')
  });

});
