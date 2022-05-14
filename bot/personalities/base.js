"use strict"

const commands = require("../commands");
const logger = require("../logger");
const {sendEntry, populateMuse, findEntryInDB} = require("../helpers");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const YAML = require("yaml");
const knex = require("../db/connection");
const pug = require('pug');

const docsFolder = '../muse_web/personas/';
const documentationTemplate = pug.compileFile('./template.pug', {});

const QUERIES = [
  'what is ',
  'what are ',
  'what is the definition of ',
  'definition of ',
  'definition ',
  'define ',
  'who are the ',
  'who is ',
  'who are ',
  'describe ',
  'look up ',
  'lookup ',
  'what about ',
  'tell me about ',
  'do you know about ',
  'what do you know about ',
];

const tokenSplit = /\s+/;
const spaceCollapse = /\s{2,}/g;
const punctuationRx = /[~!@#$%^&*()`{}\[\];:"'<,.>?\/\\|\-_+=]+/g;

class BasePersonality {
  static data = null;

  constructor(prefix) {
    this.tokens = [];
    this.prefix = prefix;
    this.channelId = null;
    this.lookup = null;
    this.content = null;
    this.originalContent = null;
    this.authorId = null;
    this.knowledge = null;
  }

  async getTokens(msg) {
    this.content = msg.content;
    this.content = this.content.toLocaleLowerCase().trim();
    this.tokens = this.content.split(tokenSplit);
    if (this.tokens.length === 1)
      this.tokens.push('help');
    else if (this.tokens.length ===2) {
      if (this.tokens[1] === '-about')
        this.tokens[1] = 'about';
      else if (this.tokens[1] === '-help')
        this.tokens[1] = 'help';
    }

    let ot = msg.content.split(tokenSplit);
    ot.shift();
    this.originalContent = ot.join(' ');
  }

  prefixMatch() {
    return this.tokens[0] === this.prefix;
  }

  async doHelp(msg) {
    const commandList = Object.keys(commands).join(', ');
    const helpText = `Add text after \`${this.prefix}\` and I will look up information about the topic. For example, enter \`${this.prefix} c-ball\` to find out information about c-ball.

My current persona is ${this.constructor.title}. You can change my persona with the \`-persona\` command.

I know the following commands: ${commandList}`;
    let entry = {
      title: 'Help',
      text: helpText
    }
    await sendEntry(msg, entry, this);
  }

  async findEntry() {
    let entry = await findEntryInDB(this.lookup, this.channelId, this.constructor.id);
    if (entry)
      return entry;

    const nos = this.lookup.replace(/s$/, "");
    entry = await findEntryInDB(nos, this.channelId, this.constructor.id);
    if (entry)
      return entry;

    const pluss = this.lookup + 's';
    entry = await findEntryInDB(pluss, this.channelId, this.constructor.id);
    return entry;
  }

  async getLookup() {
    this.lookup = this.tokens.join(' ');
    if (this.lookup.startsWith('please '))
      this.lookup = this.lookup.substring(7);

    for (let q of QUERIES) {
      if (this.lookup.startsWith(q)) {
        this.lookup = this.lookup.substring(q.length);
        break;
      }
    }
    if (this.lookup.startsWith('the '))
      this.lookup = this.lookup.substring(4);
    if (this.lookup.startsWith('a '))
      this.lookup = this.lookup.substring(2);
    if (this.lookup === 'you')
      this.lookup = 'muse';
  }

  async checkExternal(msg) {
    return null;
  }

  async doCommand(msg) {
    return await commands[this.tokens[1]].do(msg, this);
  }

  async replyToMessage(msg) {
    if (commands[this.tokens[1]])
      return this.doCommand(msg);

    this.tokens.shift();
    this.channelId = msg.channel.id;
    this.authorId = msg.author.id;

    this.getLookup();

    if (this.lookup === 'help')
      return await this.doHelp(msg);

    const entry = await this.findEntry();
    if (entry)
      await sendEntry(msg, entry, this);
    else if (!await this.checkExternal(msg))
      await this.noMatch(msg);
  }

  async noMatch(msg) {
    await msg.reply(`no data found for ${this.lookup}`);
  }

  async handleMessage(msg) {
    try {
      await this.getTokens(msg);
      if (!this.prefixMatch())
        return;
      await this.replyToMessage(msg);
    } catch (err) {
      logger.error(err);
      await msg.reply(err);
    } finally {
      logger.info(`${msg.channelId} ${msg.author.id} ${msg.content}`);
    }
  }

  async loadYAMLFile(filename) {
    let file = fs.readFileSync(filename, 'utf8');
    const y = YAML.parse(file);
    for (const k of Object.keys(y)) {
      let goodK = k.replace(punctuationRx, ' ');
      goodK = goodK.replace(spaceCollapse, ' ');
      goodK = goodK.replace(/^\s+/, '');
      goodK = goodK.replace(/\s+$/, '');
      goodK = goodK.toLocaleLowerCase();
      if (k !== goodK) {
        y[goodK] = y[k];
        delete y[k];
      }
    }
    return y;
  }

  async loadData() {
    try {
      if (!this.constructor.id)
        return;
      const basePath = path.resolve(__dirname, '..', '../personalities/', this.constructor.data);
      const files = fs.readdirSync(basePath);

      const yamlFiles = files.filter(function (file) {
        return path.extname(file) === ".yaml";
      });

      let muse;
      try {
        let file = fs.readFileSync(path.resolve(basePath, 'muse.yaml'), 'utf8');
        muse = YAML.parse(file);
      } catch (err) {
        muse = {};
      }

      for (const name of yamlFiles) {
        if (name !== 'muse.yaml') {
          let file = fs.readFileSync(path.resolve(basePath, name), 'utf8');
          const y = YAML.parse(file);
          muse = Object.assign(muse, y);
        }
      }
      this.knowledge = muse;
    } catch(err) {
      console.log(err);
    }
  }

  async updateDB() {
    try {
      if (!this.constructor.id)
        return;

      const trx = await knex.transaction();
      await trx('topic').where({personality: this.constructor.id}).delete();
      await populateMuse(this.constructor.id, this.knowledge, trx);

      await trx.commit();

      console.log(`data refreshed for ${this.constructor.data}`);
    } catch(err) {
      console.log(err);
    }
  }

  async createDocumentation() {
    try {
      this.loadData();
      const data = {letters: [], topics: {}};
      data.title = this.constructor.title;
      const letters = [];
      const topics = {};
      if (this.knowledge) {
        for (const topic of Object.keys(this.knowledge)) {
          let l = topic.charAt(0).toLocaleUpperCase();
          letters.push(l);
          if (topics[l] === undefined)
            topics[l] = [];
          topics[l].push(this.knowledge[topic]);
        }
        data.letters = [...new Set(letters)].sort();
        for (const l of data.letters)
          topics[l] = topics[l].sort((a,b) => { if (a.title < b.title) return -1; else return 1;});
        data.topics = topics;
      }
      const docs = documentationTemplate(data);
      console.log(`documentation generated for ${this.constructor.data}`);
      await fsp.writeFile(docsFolder + this.constructor.data + '.html', docs);
    } catch(err) {
      console.log(err);
    }
  }

}

module.exports = BasePersonality;
