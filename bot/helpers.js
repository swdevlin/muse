const muse = require("./muse");
const logger = require("./logger");
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const populateMuse = async (server_id, trx) => {
  for (const topic of Object.keys(muse)) {
    await trx('topic').insert({
      title: muse[topic].title,
      key: topic,
      text: muse[topic].text,
      custom: false,
      modified: false,
      parent: muse[topic].parent,
      page: muse[topic].page,
      alias_for: muse[topic].references,
      server_id: server_id
    }).onConflict(['server_id', 'key']).merge();
  }
}

const populateCampaign = async (server_id, trx) => {
  let file = fs.readFileSync( path.resolve(__dirname, 'campaign.yaml'), 'utf8');
  const campaign = YAML.parse(file);
  for (const topic of Object.keys(campaign)) {
    await trx('topic').insert({
      title: campaign[topic].title,
      key: topic,
      text: campaign[topic].text,
      custom: true,
      modified: false,
      parent: campaign[topic].parent,
      page: campaign[topic].page,
      alias_for: campaign[topic].references,
      server_id: server_id
    }).onConflict(['server_id', 'key']).merge();
  }
}

const deleteCoreMuseEntries = async (discord_id, trx) => {
  const server_id = await getServerId(discord_id, trx);
  await trx('topic')
    .where({server_id: server_id, custom: false})
    .delete();
}

const deleteMuseEntries = async (discord_id, trx) => {
  const server_id = await getServerId(discord_id, trx);
  await trx('topic')
    .where({server_id: server_id})
    .delete();
}

const getServerId = async (discord_id, trx) => {
  const server = await trx('discord_server').select('id').where({discord_id: discord_id});
  if (server.length === 1) {
    return parseInt(server[0].id);
  } else
    return null;
}

const sendEntry = async (msg, entry) => {
  let text;
  if (entry.page)
    text = `**${entry.title}**   :book: ${entry.page}\n${entry.text}`;
  else
    text = `**${entry.title}**\n${entry.text}`;
  await msg.reply(text);
}

const hackDetected = async (msg) => {
  const text = 'infosec check failed';
  logger.info(`permissions fail - ${msg.guild.id} ${msg.author.id} ${msg.content}`);
  await msg.reply(text);
}

module.exports = {
  deleteCoreMuseEntries: deleteCoreMuseEntries,
  deleteMuseEntries: deleteMuseEntries,
  getServerId: getServerId,
  populateMuse: populateMuse,
  populateCampaign: populateCampaign,
  sendEntry: sendEntry,
  hackDetected: hackDetected,
}
