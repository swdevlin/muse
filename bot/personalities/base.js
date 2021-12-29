"use strict"

const commands = require("../commands");
const logger = require("../logger");
const {sendEntry, populateMuse, findEntryInDB} = require("../helpers");
const path = require("path");
const fs = require("fs");
const YAML = require("yaml");
const knex = require("../db/connection");

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
  'what about ',
  'tell me about ',
  'do you know about ',
  'what do you know about ',
];

const tokenSplit = /\s+/;

class BasePersonality {
  static data = null;

  constructor(prefix) {
    this.tokens = [];
    this.prefix = prefix;
    this.channelId = null;
    this.lookup = null;
    this.content = null;
    this.originalContent = null;
  }

  async getTokens(msg) {
    this.content = msg.content;
    this.content = this.content.toLocaleLowerCase().trim();
    this.tokens = this.content.split(tokenSplit);
    if (this.tokens.length === 1)
      this.tokens.push('help');

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

My current personality is ${this.constructor.title}. You can change my personality with the \`-personality\` command.

I know the following commands: ${commandList}

You can configure me using a browser at ${process.env.WEB_URL}`;
    let entry = {
      title: 'Help',
      text: helpText
    }
    await sendEntry(msg, entry);
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
      this.lookup = this.lookup.substr(7);

    for (let q of QUERIES) {
      if (this.lookup.startsWith(q)) {
        this.lookup = this.lookup.substr(q.length);
        break;
      }
    }
    if (this.lookup.startsWith('the '))
      this.lookup = this.lookup.substr(4);
    if (this.lookup.startsWith('a '))
      this.lookup = this.lookup.substr(2);
    if (this.lookup === 'you')
      this.lookup = 'muse';
  }

  async replyToMessage(msg) {
    if (commands[this.tokens[1]])
      return await commands[this.tokens[1]].do(msg, this.constructor.id);

    this.tokens.shift();
    this.getLookup();

    if (this.lookup === 'help')
      return await this.doHelp(msg);

    this.channelId = msg.channel.id;

    const entry = await this.findEntry();
    if (entry)
      await sendEntry(msg, entry);
    else
      await this.noMatch(msg);
  }

  async noMatch(msg) {
    await msg.reply(`no data found for ${this.lookup}`);
  }

  async handleMessage(msg) {
    try {
      this.getTokens(msg);
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

  async loadData() {
    try {
      if (!this.constructor.id)
        return;
      const basePath = path.resolve(__dirname, '..', '../personalities/', this.constructor.data);
      const files = fs.readdirSync(basePath);

      const yamlFiles = files.filter(function (file) {
        return path.extname(file) === ".yaml";
      });

      let file = fs.readFileSync(path.resolve(basePath, 'muse.yaml'), 'utf8');
      let muse = YAML.parse(file);

      for (const name of yamlFiles) {
        if (name !== 'muse.yaml') {
          let file = fs.readFileSync(path.resolve(basePath, name), 'utf8');
          const y = YAML.parse(file);
          muse = Object.assign(muse, y);
        }
      }

      const trx = await knex.transaction();

      await populateMuse(this.constructor.id, muse, trx);

      await trx.commit();

      console.log(`data refreshed for ${this.constructor.data}`);
    } catch(err) {
      console.log(err);
    }
  }
}

module.exports = BasePersonality;
