"use strict"

const logger = require("../logger");
const {sendEntry, populateMuse, findEntryInDB} = require("../helpers");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const YAML = require("yaml");
const knex = require("../db/connection");
const pug = require('pug');
const {PermissionsBitField} = require("discord.js");
const Random = require("random-js").Random;
const rng = new Random();

const AWS = require('aws-sdk');
const campaignLoader = require("../campaignLoader");

const PRIVATE_SOURCE = 1;
const STANDARD_SOURCE = 2;

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

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

const spaceCollapse = /\s{2,}/g;
const punctuationRx = /[~!@#$%^&*()`{}\[\];:"'<,.>?\/\\|\-_+=]+/g;

class BasePersonality {
  static data = null;
  static webAbout = '';
  static wikiBase = null;

  constructor(prefix) {
    this.prefix = prefix;
    this.channelId = null;
    this.lookup = null;
    this.search = null;
    this.originalContent = null;
    this.authorId = null;
    this.knowledge = null;
  }

  async getSearch(interaction) {
    this.originalContent = interaction.options.getString('topic');
    this.search = this.originalContent.toLocaleLowerCase().trim();
  }

  async doHelp(interaction) {
    const helpText = `Use the /muse command and specify a topic and I will look up information about the topic. For example, enter \`/muse c-ball\` to find out information about c-ball.

My current persona is ${this.constructor.title}. You can change my persona with the \`/persona\` command.`;
    let entry = {
      title: 'Help',
      text: helpText
    }
    await sendEntry(interaction, entry, this);
  }

  async doAbout(interaction) {
    const helpText = `Muse is an RPG dictionary bot inspired by the muse ALI in the Eclipse Phase RPG published by Posthuman Studios.
    
Muse was built to help players with quick rules lookups and to deliver small bits of lore about the game setting.

Each Discord server channel sets the game system to use; Muse calls these personas. Personas have information specific
to a game system, typically rule summaries. GMs can also import campaign files with entries specific to their game. These
entries are only available on the channel where they were imported. This enables Muse to support a unique game
on each channel in the Discord server.
    
Muse is opensource. You can find the project at https://github.com/swdevlin/muse . Pull requests welcomed. :smiley:   

_version: 10_`;
    let entry = {
      title: 'About',
      text: helpText
    }
    await sendEntry(interaction, entry, this);
  }

  async doDiagnostics(interaction) {
    const {channel} = interaction;

    try {
      await interaction.reply({ content: 'running self diagnostics....', ephemeral: true });
      const topics = await knex('topic')
        .where({personality: this.constructor.id, alias_for: null})
        .count('topic.id as topic_count');

      const campaign = await knex('channel_topic')
        .join('channel', 'channel.id', 'channel_topic.channel_id')
        .where({'channel.id': channel.id, alias_for: null})
        .count('channel_topic.id as topic_count');

      const message = `I know ${topics[0].topic_count} persona topics and ${campaign[0].topic_count} campaign topics.`;
      logger.info(`diagnostics run for ${channel.id}`);
      await interaction.followUp({ content: message, ephemeral: true });
    } catch(err) {
      logger.error(err);
    }
  }

  async doPublic(interaction) {
    this.channelId = interaction.channel.id;
    this.authorId = interaction.user.id;

    try {
      await this.getSearch(interaction);
      this.getLookup();
      const entry = await this.findEntry();
      if (entry) {
        if (entry.id) {
          await knex('channel_topic')
            .where({id: entry.id})
            .update({is_private: false});

          await interaction.reply({ content: `${entry.title} is now public`, ephemeral: true });
          logger.info(`${entry.title} made public on ${this.channelId}`);
        } else {
          await interaction.reply({ content: `${entry.title} is not a campaign topic`, ephemeral: true });
          logger.info(`${entry.title} not a campaign topic on ${this.channelId}`);
        }
      } else
        await interaction.reply({ content: `${this.originalContent} was not found`, ephemeral: true });
    } catch(err) {
      logger.error(err);
    }
  }

  async doPrivate(interaction) {
    this.channelId = interaction.channel.id;
    this.authorId = interaction.user.id;

    try {
      await this.getSearch(interaction);
      this.getLookup();
      const entry = await this.findEntry();
      if (entry) {
        if (entry.id) {
          await knex('channel_topic')
            .where({id: entry.id})
            .update({is_private: true});

          await interaction.reply({ content: `${entry.title} is now private`, ephemeral: true });
          logger.info(`${entry.title} made private on ${this.channelId}`);
        } else {
          await interaction.reply({ content: `${entry.title} is not a campaign topic`, ephemeral: true });
          logger.info(`${entry.title} not a campaign topic on ${this.channelId}`);
        }
      } else
        await interaction.reply({ content: `${this.originalContent} was not found`, ephemeral: true });
    } catch(err) {
      logger.error(err);
    }
  }

  async doReset(interaction) {
    const {channel} = interaction;

    try {
      await knex('channel_topic').delete().where({channel_id: channel.id});
      logger.info(`campaign entries deleted for ${channel.id}`);
      const message = `Campaign entries have been deleted.`;
      await interaction.reply({ content: message, ephemeral: true });
    } catch(err) {
      logger.error(err);
    }
  }

  async doCampaign(interaction) {
    try {
      const campaignFile = interaction.options.getAttachment('campaign');
      if (campaignFile.size === 0)
        return await interaction.reply({ content: 'campaign file is empty', ephemeral: true });

      await interaction.deferReply({ephemeral: true});
      await campaignLoader(interaction);
    } catch(err) {
      logger.error(err);
    }
  }

  async doPersona(interaction) {
    let newPersona = interaction.options.getString('persona');
    if (newPersona === null) {
      const msg = `My current persona is ${this.constructor.title}.`;
      await interaction.reply(msg);
    } else {
      const channel = interaction.channel;
      if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        newPersona = parseInt(newPersona);
        const personalities = require("../personalities");
        const p = personalities[newPersona];
        await knex('channel').update({personality: p.id}).where({id: channel.id});
        logger.info(`persona changed to ${p.textName} for ${channel.id}`);
        return await interaction.reply(`My persona has been changed to ${p.title}`)
      } else {
        const text = 'Only channel admins can change my persona';
        logger.info(`persona permissions fail - ${channel.id} ${interaction.user.id}`);
        return await interaction.reply(text);
      }
    }
  }

  async doRandom(interaction) {
    const {channel} = interaction;

    try {
      const items = await knex.select('key')
        .from('topic')
        .where({personality: this.constructor.id, alias_for: null});

      const r = rng.integer(0, items.length-1);
      let entry = await findEntryInDB(items[r].key, channel.id, this.constructor.id);
      await sendEntry(interaction, entry, this);
      logger.info(`${channel.id} ${interaction.user.id} random`);
    } catch(err) {
      logger.error(err);
    }
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
    this.lookup = this.search;
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
  }

  async checkExternal(interaction) {
    return null;
  }

  async replyToMessage(interaction) {
    this.channelId = interaction.channel.id;
    this.authorId = interaction.user.id;

    this.getLookup();

    try {
      await interaction.deferReply();
      const entry = await this.findEntry();
      if (entry) {
        if (entry.is_private) {
          if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            await sendEntry(interaction, entry, this);
            logger.info(`${interaction.channelId} ${interaction.user.id} ${this.originalContent}`);
          } else
            await this.noMatch(interaction);
        } else {
          await sendEntry(interaction, entry, this);
          logger.info(`${interaction.channelId} ${interaction.user.id} ${this.originalContent}`);
        }
      } else if (!await this.checkExternal(interaction))
        await this.noMatch(interaction);
    } catch(err) {
      logger.error(err);
      await interaction.editReply("Unable to process request at this time");
    }
  }

  async noMatch(interaction) {
    await interaction.editReply(`no data found for ${this.lookup}`);
  }

  async handleButton(interaction) {

  }

  async handleInteraction(interaction) {
    try {
      if (interaction.commandName === 'help')
        await this.doHelp(interaction);
      else if (interaction.commandName === 'about')
        await this.doAbout(interaction);
      else if (interaction.commandName === 'persona')
        await this.doPersona(interaction);
      else if (interaction.commandName === 'diagnostics')
        await this.doDiagnostics(interaction);
      else if (interaction.commandName === 'reset')
        await this.doReset(interaction);
      else if (interaction.commandName === 'public')
        await this.doPublic(interaction);
      else if (interaction.commandName === 'private')
        await this.doPrivate(interaction);
      else if (interaction.commandName === 'campaign')
        await this.doCampaign(interaction);
      else if (interaction.commandName === 'random')
        await this.doRandom(interaction);
      else {
        await this.getSearch(interaction);
        await this.replyToMessage(interaction);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      // Should log something here
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

  async loadData(sources = PRIVATE_SOURCE | STANDARD_SOURCE) {
    try {
      if (!this.constructor.id)
        return;
      const basePath = path.resolve(__dirname, '..', '../personalities/', this.constructor.data);
      const files = fs.readdirSync(basePath);

      let yamlFiles = [];
      if (sources & STANDARD_SOURCE) {
        let sFiles = files.filter(function (file) {
          return path.extname(file) === ".yaml";
        });
        yamlFiles = sFiles.map(function(f) { return path.resolve(basePath, f)});
      }

      let additionalYaml = []
      if (sources & PRIVATE_SOURCE) {
        const privatePath = path.resolve(__dirname, '..', '..', 'personalities', 'private', this.constructor.data);
        if (fs.existsSync(privatePath)) {
          const privateFiles = fs.readdirSync(privatePath);
          additionalYaml = privateFiles.filter(function (file) {
            return path.extname(file) === ".yaml";
          });
          additionalYaml = additionalYaml.map(function(f) { return path.resolve(privatePath, f)});
        }
      }

      let muse = {};
      try {
        if (sources & STANDARD_SOURCE) {
          let file = fs.readFileSync(path.resolve(basePath, 'muse.yaml'), 'utf8');
          muse = YAML.parse(file);
        }
      } catch (err) {
        muse = {};
      }

      for (const name of [...yamlFiles, ...additionalYaml]) {
        if (!name.endsWith('muse.yaml')) {
          let file = fs.readFileSync(name, 'utf8');
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
      const data = {letters: [], topics: {}};
      data.title = this.constructor.title;
      const letters = [];
      const topics = {};
      await this.loadData(PRIVATE_SOURCE);
      if (this.knowledge) {
        for (const topic of Object.keys(this.knowledge)) {
          let l = topic.charAt(0).toLocaleUpperCase();
          this.knowledge[topic].title = topic;
          letters.push(l);
          if (topics[l] === undefined)
            topics[l] = [];
          this.knowledge[topic].text = 'Topic text only available via Muse.';
          topics[l].push(this.knowledge[topic]);
        }
      }
      await this.loadData(STANDARD_SOURCE);
      if (this.knowledge) {
        for (const topic of Object.keys(this.knowledge)) {
          let l = topic.charAt(0).toLocaleUpperCase();
          this.knowledge[topic].title = topic;
          letters.push(l);
          if (topics[l] === undefined)
            topics[l] = [];
          topics[l].push(this.knowledge[topic]);
        }
      }
      data.letters = [...new Set(letters)].sort();
      for (const l of data.letters)
        topics[l] = topics[l].sort((a,b) => { if (a.title < b.title) return -1; else return 1;});
      data.topics = topics;
      data.about = this.constructor.webAbout;
      const docs = documentationTemplate(data);
      console.log(`documentation generated for ${this.constructor.data}`);
      await fsp.writeFile(docsFolder + this.constructor.data + '.html', docs);
    } catch(err) {
      console.log(err);
    }
  }

}

module.exports = BasePersonality;
