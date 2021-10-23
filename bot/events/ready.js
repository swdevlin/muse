"use strict"

const client = require("../client");
const logger = require("../logger");

const ready = async () => {
  logger.info(`Logged in as ${client.user.tag}`);

  // validate user permissions
};

module.exports = ready;
