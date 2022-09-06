"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { REST } = require('@discordjs/rest');
const { Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [];

commands.push(
  new SlashCommandBuilder()
    .setName('muse')
    .setDescription('Lookup a topic')
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('The topic to search for')
        .setRequired(true)
    )
);

commands.push(
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show Muse help')
);

commands.push(
  new SlashCommandBuilder()
    .setName('random')
    .setDescription('Show a random entry from the knowledgebase')
);

commands.push(
  new SlashCommandBuilder()
    .setName('diagnostics')
    .setDescription('Show data about Muse')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannel)
);

commands.push(
  new SlashCommandBuilder()
    .setName('reset')
    .setDescription("Remove Muse's campaign entries")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannel)
);

const personaChoices = [];
const personalities = require("./personalities");
for (const k of Object.keys(personalities)) {
  const persona = personalities[k];
  personaChoices.push({name: persona.title, value: `${persona.id}`})
}

commands.push(
  new SlashCommandBuilder()
    .setName('persona')
    .setDescription('Show or change my persona')
    .addStringOption(option =>
      option.setName('persona')
        .setDescription('The new persona')
        .setRequired(false)
        .addChoices(...personaChoices)
    )
);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();
