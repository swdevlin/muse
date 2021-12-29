"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const chai = require('chai');
chai.should();
const expect = chai.expect;
const sinon = require('sinon');
const Traveller = require("../personalities/traveller");

describe('Test Traveller', function () {
  let context = null;

  beforeEach(async() => {
    context = {
      msg: {
        author: {
          id: 'user1',
          send: sinon.stub().resolves('ok'),
        },
        channel: {
          guild: {
            id: 'test'
          },
          id: 'channel'
        },
        reply: sinon.stub().resolves('ok'),
      }
    };
    context.traveller = new Traveller('tb');
  })

  it('validates the UWP string', async() => {
    context.msg.content = 'tb A1234ab-9';
  });

  it('check for bad law', function() {
    const uwp = ['A', '1', '2', '3', '4', 'a', 'b', '9'];
    const isOk = context.traveller.validateUWP(uwp);
    expect(isOk).to.be.false;
  });

  it('Handle no starport', function() {
    const response = context.traveller.starportText('X');
    const expected = '\tThere is **no starport** on this planet\n\tThis port has **No fuel**';
    response.should.equal(expected);
  });

  it('Handle standard starport', function() {
    const response = context.traveller.starportText('B');
    const expected = '\tThis port is Good\n\tBerthing costs are 1DxCR500 per day\n\tThis port has Refined fuel';
    response.should.equal(expected);
  });

  it('Handle planet size', function() {
    const response = context.traveller.planetSizeText('1');
    const expected = '\t1,600km in diameter\n\tGravity is 0.05G';
    response.should.equal(expected);
  });

  it('Handle standard atmosphere', function() {
    const response = context.traveller.atmosphereText('2');
    const expected = '\tVery Thin, Tainted atmosphere\n\tThis atmosphere requires Respirator & Filter';
    response.should.equal(expected);
  });

  it('Handle no special gear', function() {
    const response = context.traveller.atmosphereText('5');
    const expected = '\tThin atmosphere\n\tNo special gear is required';
    response.should.equal(expected);
  });

  it('Handle hydrographics', function() {
    const response = context.traveller.hydrosphereText('3');
    const expected = '\tSmall seas and Oceans';
    response.should.equal(expected);
  });

  it('population is expanded and nicely formatted', function() {
    const response = context.traveller.populationText('4');
    const expected = '\t10,000';
    response.should.equal(expected);
  });

  it('government has all the details', function() {
    const response = context.traveller.governmentText('5');
    const expected = '\tFeudal Technocracy';
    response.should.equal(expected);
  });

  it('law shows bans', function() {
    const response = context.traveller.lawText('6');
    const expected = '\t*Bans*:\n\t\tAll Firearms, except shotguns and stunners;\n\t\tCloth, Flak, Combat Armour, Battle Dress';
    response.should.equal(expected);
  });

  it('tech description', function() {
    const response = context.traveller.techText('9');
    const expected = '\tTL 9\n\tPre-Stellar';

    response.should.equal(expected);
  });

  it('should put all the pieces together', async function() {
    context.msg.content = 'tb B123456-9';
    const description = context.traveller.uwpDescription(['B', '1', '2', '3', '4', '5', '6', '9']);
    let expected = `**Starport (B)**\n${context.traveller.starportText('B')}\n`;
    expected += `**Size (1)**\n${context.traveller.planetSizeText('1')}\n`;
    expected += `**Atmosphere (2)**\n${context.traveller.atmosphereText('2')} \n`;
    expected += `**Hydrosphere (3)**\n${context.traveller.hydrosphereText('3')}\n`;
    expected += `**Population: (4)**\n${context.traveller.populationText('4')}\n`;
    expected += `**Government (5)**\n${context.traveller.governmentText('5')} \n`;
    expected += `**Law (6)**\n${context.traveller.lawText('6')}  \n`;
    expected += `**Tech (9)**\n ${context.traveller.techText('9')}  \n`;
    description.should.equal(expected);
  });

  it('null entry is returned if message is not a UWP', function() {
    context.traveller.originalContent = 'not a uwp';
    const entry = context.traveller.checkForUWP();
    expect(entry).to.be.null;
  })

  it('entry has original UWP as the title', function() {
    context.traveller.originalContent = 'C782632-C';
    const entry = context.traveller.checkForUWP();
    entry.title.should.equal('C782632-C');
  })

  it('text for entry is UWP breakdown', function() {
    context.traveller.originalContent = 'B123456-9';
    const entry = context.traveller.checkForUWP();
    let expected = `**Starport (B)**\n${context.traveller.starportText('B')}\n`;
    expected += `**Size (1)**\n${context.traveller.planetSizeText('1')}\n`;
    expected += `**Atmosphere (2)**\n${context.traveller.atmosphereText('2')} \n`;
    expected += `**Hydrosphere (3)**\n${context.traveller.hydrosphereText('3')}\n`;
    expected += `**Population: (4)**\n${context.traveller.populationText('4')}\n`;
    expected += `**Government (5)**\n${context.traveller.governmentText('5')} \n`;
    expected += `**Law (6)**\n${context.traveller.lawText('6')}  \n`;
    expected += `**Tech (9)**\n ${context.traveller.techText('9')}  \n`;
    entry.text.should.equal(expected);
  })

});
