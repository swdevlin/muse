"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const chai = require('chai');
chai.should();
const BasePersonality = require("../personalities/base");
const fs = require("fs");
const YAML = require("yaml");
const campaignParser = require("../campaignParser");

describe('Test campaign file verifier', function () {
  it('valid file parses ok', async() => {
    const yamlFile = path.resolve(__dirname, 'data', 'valid_campaign.yaml');
    let file = fs.readFileSync(yamlFile, 'utf8');
    const result = await campaignParser(file);
    chai.expect(result.error).to.be.null;
  });

  it('key cannot contain hypen', async() => {
    const entry = `'-entry':
    title: Entry
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('-entry cannot start with a -');
  });

  it('key cannot start with a space', async() => {
    const entry = `' entry':
    title: Entry
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal(' entry cannot start with a space');
  });

  it('key cannot end with a space', async() => {
    const entry = `'entry ':
    title: Entry
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('entry  cannot end with a space');
  });

  it('key cannot contain multiple spaces', async() => {
    const entry = `'entry  sample':
    title: Entry
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('entry  sample cannot have multiple spaces');
  });

  it('key cannot exceed max length', async() => {
    const key = 'a'.repeat(101);
    const entry = `'${key}':
    title: Entry
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.contain('exceeds max length of');
  });

  it('key cannot contain punctuation', async() => {
    let entry = `'entry$sample':
    title: Entry
    text: some text
    `;
    let result = await campaignParser(entry);
    result.error.should.equal('entry$sample cannot have punctuation');

    entry = `'entry\\sample':
    title: Entry
    text: some text
    `;
    result = await campaignParser(entry);
    result.error.should.equal('entry\\sample cannot have punctuation');

    entry = `'entry[sample':
    title: Entry
    text: some text
    `;
    result = await campaignParser(entry);
    result.error.should.equal('entry[sample cannot have punctuation');
  });

  it('entry must have text', async() => {
    const entry = `sample:
    title: Entry
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('sample has no text');
  });

  it('entry title cannot be blank', async() => {
    const entry = `sample:
    title:
    text: some text
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('sample has a blank title');
  });

  it('entries must have valid keys', async() => {
    const entry = `sample:
    title: Sample
    text: some text
    bad_value: should not be here
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('sample has an invalid attribute: bad_value');
  });

  it('aliases must be a list', async() => {
    let entry = `sample:
    title: Sample
    aliases: other
    text: some text
    `;
    let result = await campaignParser(entry);
    result.error.should.equal('sample aliases must be a list');

    entry = `sample:
    title: Sample
    aliases:
        - other
    text: some text
    `;
    result = await campaignParser(entry);
    chai.expect(result.error).to.be.null;
  });

  it('aliases cannot contain hypen', async() => {
    const entry = `'entry':
    title: Entry
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
    title: Sample
    text: 132.5
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('sample text is an invalid data type');
  });

  if('text does not exceed max length', async() => {
    const t = 'a'.repeat(4001);
    const entry = `long:
    title: Entry
    text: ${t}
    aliases:
      - two
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('long text exceeds max length of 2000');
  });

  if('wiki_slug does not exceed max length', async() => {
    const t = 'a'.repeat(4001);
    const entry = `long:
    title: Entry
    text: test text
    wiki_slug: ${t}
    aliases:
      - two
    `;
    const result = await campaignParser(entry);
    result.error.should.equal('long text exceeds max length of 2000');
  });

});
