"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const logger = require("./logger");
const knex = require("./db/connection");

const { Consumer } = require('sqs-consumer');
const AWS = require('aws-sdk');
const https = require('https');
const fetch = require('node-fetch');
const discordClient = require("./client");
const campaignParser = require("./campaignParser");

const handleRequest = async (msg) => {
  try {
    const request = JSON.parse(msg.Body);
    const response = await fetch(request.file);
    const text = await response.text();
    const dmChannel = await discordClient.channels.fetch(request.message_channel_id);
    const message = await dmChannel.messages.fetch(request.message_id);
    const channel = await discordClient.channels.fetch(request.channel_id);
    if (!channel)
      return await message.reply(`That channel ID is not valid`);
    const {entries, error} = await campaignParser(text);
    if (error) {
      return await message.reply(`An error occurred processing the file: ${error}`);
    } else {
      for (const topic of Object.keys(entries)) {
        const entry = entries[topic];
        await knex('channel_topic').insert({
          title: topic,
          channel_id: request.channel_id,
          key: topic.toLocaleLowerCase(),
          text: entry.text,
          parent: entry.parent ? entry.parent.toLocaleLowerCase() : null,
          image: entry.image,
          category: entry.category,
          wiki_slug: entry.wiki_slug,
          page: entry.page,
        }).onConflict(['channel_id', 'key']).merge();
        if (entry.aliases)
          for (const alias of entry.aliases) {
            await knex('channel_topic').insert({
              title: alias,
              key: alias.toLocaleLowerCase(),
              alias_for: topic.toLocaleLowerCase(),
              channel_id: request.channel_id
            }).onConflict(['channel_id', 'key']).ignore();
          }
      }
      return await message.reply(`Import completed`);
    }
  } catch (e) {
    logger.error(e);
  }
}

const app = Consumer.create({
  queueUrl: process.env.SQS_CAMPAIGN_QUEUE,
  handleMessage: handleRequest,
  sqs: new AWS.SQS({
    httpOptions: {
      agent: new https.Agent({
        keepAlive: true
      })
    },
    region: process.env.EB_AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  })
});

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();
