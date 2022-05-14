"use strict";

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });


;(async (scount) => {
  const personalities = require("./personalities");

  for (const k of Object.keys(personalities)) {
    const p = new personalities[k]();
    await p.loadData();
    await p.createDocumentation()
  }
  console.log('finished loading data');
})()
  .then(res => process.exit(0))
  .catch(err => {
    console.log(err.stack);
    process.exit(0);
  });
