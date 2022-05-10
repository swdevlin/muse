"use strict"

const logger = require("./logger");
const discordClient = require("./client");
const { Permissions } = require('discord.js');

const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const tokenSplit = /\s+/;
const validID = /^\d+$/;

const dm = async msg => {
  let content = msg.content;
  content = content.toLocaleLowerCase().trim();
  let tokens = content.split(tokenSplit);
  if (tokens.length === 0)
    tokens.push('help');

  if (tokens[0] === 'help') {

  } else if (tokens[0] === 'upload') {
    if (tokens.length !== 2)
      return await msg.reply('invalid format');

    const channelId = tokens[1];
    if (!channelId.match(validID))
      return await msg.reply('invalid channel id');

    // check that the user is a admin of the channel
    const channel = discordClient.channels.cache.get(channelId);
    if (!channel)
      return await msg.reply('invalid channel id');
    if (!channel.isText())
      return await msg.reply('invalid channel id');
    let guild = channel.guild;
    let member = await guild.members.fetch(msg.author.id);
    let permissions = channel.permissionsFor(member);

    if (!permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
      return await msg.reply('You must be able to manage the channel to upload content');

    if (msg.attachments.size === 0)
      return await msg.reply('file missing');

    // create a job to parse the file
    const job = {
      channel_id: channelId,
      message_channel_id: msg.channelId,
      user: msg.author.id,
      file: msg.attachments.first().url,
      message_id: msg.id,
    }
    const params = {
      MessageBody: JSON.stringify(job),
      QueueUrl: process.env.SQS_CAMPAIGN_QUEUE
    };
    const data = await sqs.sendMessage(params).promise();

    // notify the user
    return await msg.reply('Import job started');

  } else
    return await msg.reply('invalid command');

}


module.exports = dm;
