const muse = require("../muse");
const client = require("../client");
const logger = require("../logger");

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

const queries = [
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

const sendEntry = async (msg, muse) => {
  const text = `**${muse.title}**\n${muse.text}`;
  await msg.reply(text);
}

const message = async (msg) => {
  // ignore our own messages
  if (`${msg.author.username}#${msg.author.discriminator}` === client.user.tag)
    return;

  const tokens = msg.content.split(' ');
  if (tokens < 2)
    return;
  if (!muse_prefix.startsWith(tokens[0]))
    return;

  const {id: author_id} = msg.author;
  const {channel} = msg;
  const {guild} = channel;
  try {
    tokens.shift();
    let lookup = tokens.join(' ').toLocaleLowerCase().trim();
    if (lookup.startsWith('please '))
      lookup = lookup.substr(7);

    for (let q of queries) {
      if (lookup.startsWith(q)) {
        lookup = lookup.substr(q.length);
        break;
      }
    }
    if (lookup.startsWith('the '))
      lookup = lookup.substr(4);
    if (lookup.startsWith('a '))
      lookup = lookup.substr(2);
    if (muse[lookup]) {
      await sendEntry(msg, muse[lookup]);
    } else {
      const nos = lookup.replace(/s$/, "");
      if (muse[nos])
        await sendEntry(msg, muse[nos]);
      else {
        const pluss = lookup + 's';
        if (muse[pluss])
          await sendEntry(msg, muse[pluss]);
        else
          await msg.reply(`no data found for ${lookup}`);
      }
    }
  } catch(err) {
    logger.error(err);
    await msg.reply(err);
  } finally {
    logger.info(`${guild.id} ${author_id} ${msg.content}`);
  }
}

module.exports = message;
