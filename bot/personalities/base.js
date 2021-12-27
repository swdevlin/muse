"use strict"

const commands = require("../commands");
const logger = require("../logger");
const {sendEntry, findEntry, addGuild, populateMuse, populateCampaign} = require("../helpers");
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
  }

  getTokens = async (msg) => {
    this.content = msg.content;
    this.content = this.content.toLocaleLowerCase().trim();
    this.tokens = this.content.split(tokenSplit);
    if (this.tokens.length === 1)
      this.tokens.push('help');
  }

  prefixMatch = () => {
    return this.tokens[0] === this.prefix;
  }

  doHelp = async (msg) => {
    const commandList = Object.keys(commands).join(', ');
    const helpText = `Add text after \`${this.prefix}\` and I will look up information about the topic. For example, enter \`${this.prefix} c-ball\` to find out information about c-ball

I know the following commands: ${commandList}

You can configure me using a browser at ${process.env.WEB_URL}`;
    let entry = {
      title: 'Help',
      text: helpText
    }
    await sendEntry(msg, entry);
  }

  replyToMessage = async (msg) => {
    if (commands[this.tokens[1]])
      return await commands[this.tokens[1]].do(msg, this.constructor.id);

    this.tokens.shift();
    let lookup = this.tokens.join(' ');
    if (lookup.startsWith('please '))
      lookup = lookup.substr(7);

    for (let q of QUERIES) {
      if (lookup.startsWith(q)) {
        lookup = lookup.substr(q.length);
        break;
      }
    }
    if (lookup.startsWith('the '))
      lookup = lookup.substr(4);
    if (lookup.startsWith('a '))
      lookup = lookup.substr(2);

    if (lookup === 'help')
      await this.doHelp(msg);
    else {
      const channel_id = msg.channel.id;
      if (lookup === 'you')
        lookup = 'muse';
      let entry = await findEntry(lookup, channel_id, this.constructor.id);
      if (entry) {
        await sendEntry(msg, entry);
      } else {
        const nos = lookup.replace(/s$/, "");
        entry = await findEntry(nos, channel_id, this.constructor.id);
        if (entry)
          await sendEntry(msg, entry);
        else {
          const pluss = lookup + 's';
          entry = await findEntry(pluss, channel_id, this.constructor.id);
          if (entry)
            await sendEntry(msg, entry);
          else
            await msg.reply(`no data found for ${lookup}`);
        }
      }
    }

  }

  handleMessage = async (msg) => {
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

  loadData = async () => {
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
