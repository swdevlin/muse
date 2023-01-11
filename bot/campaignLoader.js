"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const logger = require("./logger");
const knex = require("./db/connection");
const fetch = require('node-fetch');
const campaignParser = require("./campaignParser");

const campaignLoader = async (interaction) => {
  await interaction.editReply({ content: 'Import job started', ephemeral: true });
  try {
    const campaignFile = interaction.options.getAttachment('campaign');
    const response = await fetch(campaignFile.url);
    const text = await response.text();
    const {channel} = interaction;
    const {entries, error} = await campaignParser(text);
    if (error) {
      return await interaction.followUp({ content: `An error occurred processing the file: ${error}`, ephemeral: true });
    } else {
      for (const topic of Object.keys(entries)) {
        const entry = entries[topic];
        await knex('channel_topic').insert({
          title: topic,
          channel_id: channel.id,
          key: topic.toLocaleLowerCase(),
          text: entry.text,
          parent: entry.parent ? entry.parent.toLocaleLowerCase() : null,
          image: entry.image,
          category: entry.category,
          is_private: entry.private ? entry.private : false,
          wiki_slug: entry.wiki_slug,
          page: entry.page,
        }).onConflict(['channel_id', 'key']).merge();
        if (entry.aliases)
          for (const alias of entry.aliases) {
            await knex('channel_topic').insert({
              title: alias,
              key: alias.toLocaleLowerCase(),
              alias_for: topic.toLocaleLowerCase(),
              channel_id: channel.id
            }).onConflict(['channel_id', 'key']).ignore();
          }
      }
      return await interaction.followUp({ content: `Import of ${campaignFile.name} completed`, ephemeral: true });
    }
  } catch (e) {
    logger.error(e);
  }
}

module.exports = campaignLoader;
