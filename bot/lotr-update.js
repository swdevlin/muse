"use strict";

const fetch = require('node-fetch');
const path = require('path');
const emojiMap = require('./lotr-emoji-map');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const fs = require('fs');

;(async () => {
  const response = await fetch('https://ringsdb.com/api/public/cards/');
  const card_source = await response.json();
  const cards = {};
  const emoji = Object.keys(emojiMap);
  for (const card of card_source) {
    if (card.pack_code === 'Starter')
      continue;
    if (card.pack_code === 'MotKA')
      continue;
    if (card.pack_code === 'RoR')
      continue;
    if (card.pack_code === 'EoL')
      continue;
    if (card.pack_code === 'DoG')
      continue;
    if (card.pack_code === 'DoD')
      continue;
    card.searchKey = card.name.toLocaleLowerCase();
    card.normalizedSearchKey = card.name.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const label of emoji) {
      const rx = new RegExp(`\\[${label}\\]`,'g')
      card.text = card.text.replace(rx, emojiMap[label]);
    }
    card.text = card.text.replace(/<i>(.+)?<\/i>/g, '*$1*');
    card.text = card.text.replace(/<b>(.+)?<\/b>/g, '**$1**');
    delete card['position'];
    delete card['deck_limit'];
    delete card['illustrator'];
    delete card['octgnid'];
    delete card['octgnid'];
    cards[card.code] = card;
  }
  fs.writeFileSync(
    '../personalities/lotr/resources/lotr_cards.json',
    JSON.stringify(cards, null, 2)
  );
  console.log('finished loading data');
})()
  .then(res => process.exit(0))
  .catch(err => {
    console.log(err.stack);
    process.exit(0);
  });
