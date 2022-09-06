"use strict"

const BasePersonality = require("./base");
const cache = require("../cache");
const emojiMap = require("../lotr-emoji-map");
let cards;
try {
  cards = require('../../personalities/lotr/resources/lotr_cards.json');

} catch(err) {
  cards = {};
}

const {EmbedBuilder} = require("discord.js");

class LordOfTheRings extends BasePersonality {
  static data = 'lotr';
  static textName = 'lotr';
  static title = 'Lord of the Rings';
  static id = 3;
  static defaultPrefix = 'muse';
  static wikiBase = 'https://ringsdb.com';
  static webAbout = `
    <p>Lord of the Rings keyword and card lookup.</p>
  `;

  async checkExternal(msg) {
    const lookup = this.tokens.join(' ');
    const cache_key = this.channelId + this.authorId;
    let lastRequest = await cache.get(cache_key);
    if (lastRequest) {
      lastRequest = JSON.parse(lastRequest);
      const num = Number(lookup);
      if (Number.isInteger(num) && num-1 <= lastRequest.length)
        return await this.replyCard(msg, cards[lastRequest[num-1]]);
    }

    const matches = [];
    for (const key of Object.keys(cards))
      if (cards[key].searchKey.includes(lookup) || cards[key].normalizedSearchKey.includes(lookup))
        matches.push(key);

    if (matches.length === 1) {
      return await this.replyCard(msg, cards[matches[0]]);
    } else if (matches.length > 1) {
      let text = 'Multiple matches:\n';
      matches.forEach((key, index) => {
        const card = cards[key];
        text +=`${index+1}: ${card.name} ${emojiMap[card.sphere_code]}\n`;
      });
      await cache.set(cache_key, JSON.stringify(matches));
      await msg.reply(text);
      return true;
    } else
      return null;
  }

  async replyCard(msg, card) {
    let text = this.renderCard(card);
    let embed = new EmbedBuilder().setImage(`https://ringsdb.com${card.imagesrc}`);
    const messagePayload = {
      content: text,
      embeds: [embed]
    };
    await msg.reply(messagePayload);
    return true;
  }

  renderCard(card) {
    let text = card.text;
    text = text.replace(/\n/g, '\n\n');
    text = text.replace(/<b>/g, '**');
    text = text.replace(/<\/b>/g, '**');
    const cost = card.type_code === 'hero' ? card.threat : card.cost;
    const traits = card.traits.length ? `${card.traits}\n` : '';
    let stats = '';
    if (card.type_code === 'hero' || card.type_code === 'ally')
      stats = `\n<:lotrwillpower:971731802047774741>${card.willpower}  <:lotrattack:971732794491420672>${card.attack}  <:lotrdefense:971732765810761758>${card.defense}  <:lotrhealth:971732831761997837>${card.health}`;

    return `
**${card.name}**
${cost}${emojiMap[card.sphere_code]}  ${card.type_name}${stats}
${traits}
${text}
_ ${card.url} _    
    `;
  }

}

module.exports = LordOfTheRings;
