"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const chai = require('chai');
chai.should();
const BasePersonality = require("../personalities/base");
const fs = require("fs");
const campaignParser = require("../campaignParser");

describe('Test campaign file verifier', function () {
  it('valid file parses ok', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'valid_campaign.yaml');
    let file = fs.readFileSync(yamlFile, 'utf8');
    const result = await campaignParser(file);
    chai.expect(result.error).to.be.null;
  });

  it('key cannot start with a hyphen', async() => {
    const entry = `'-Entry':
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('-Entry cannot start with a -');
  });

  it('key cannot start with a space', async() => {
    const entry = `' Entry':
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal(' Entry cannot start with a space');
  });

  it('key cannot end with a space', async() => {
    const entry = `'Entry ':
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('Entry  cannot end with a space');
  });

  it('key cannot contain multiple spaces', async() => {
    const entry = `'Entry  sample':
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('Entry  sample cannot have multiple spaces');
  });

  it('key cannot exceed max length', async() => {
    const key = 'a'.repeat(101);
    const entry = `'${key}':
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.contain('exceeds max length of');
  });

  it('entry must have text', async() => {
    const entry = `Sample:
    page: 19
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('Sample has no text');
  });

  it('entries must have valid keys', async() => {
    const entry = `Sample:
    text: some text
    bad_value: should not be here
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('Sample has an invalid attribute: bad_value');
  });

  it('aliases must be a list', async() => {
    let entry = `Sample:
    aliases: other
    text: some text
    `;
    let result = await campaignParser(entry);
    result.error.should.equal('Sample aliases must be a list');

    entry = `Sample:
    aliases:
        - other
    text: some text
    `;
    result = await campaignParser(entry);
    chai.expect(result.error).to.be.null;
  });

  it('aliases cannot start with hyphen', async() => {
    const entry = `'Entry':
    text: some text
    aliases:
      - two
      - '-one'
      - three
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('-one cannot start with a -');
  });

  it('only integers and strings allowed', async() => {
    const entry = `sample:
    text: 132.5
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('sample text is an invalid data type');
  });

  it('text does not exceed max length', async() => {
    const t = 'a'.repeat(4001);
    const entry = `Long:
    text: ${t}
    aliases:
      - two
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('Long text exceeds max length of 2000');
  });

  it('wiki_slug does not exceed max length', async() => {
    const t = 'a'.repeat(4001);
    const entry = `Long:
    text: test text
    wiki_slug: ${t}
    aliases:
      - two
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('long text exceeds max length of 2000');
  });

});
