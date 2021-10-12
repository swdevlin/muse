const logger = require("../logger");
const client = require("../client");

const guildDelete = async guild => {
  // Delete guild from the db
  logger.info(`Removed from guild ${guild.id}`);
};

module.exports = guildDelete;

