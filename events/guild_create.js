const logger = require("../logger");
const muse = require("../muse");

const guildCreate = async guild => {
  // Add guild to the system
  // Populate muse data
  for (const topic of Object.keys(muse)) {
    logger.info(topic);
  }
  logger.info(`invited to guild ${guild.id}`);
};

module.exports = guildCreate;
