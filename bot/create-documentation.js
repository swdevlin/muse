"use strict";

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });


;(async () => {
  const personalities = require("./personalities");

  for (const k of Object.keys(personalities)) {
    const p = new personalities[k]();
    await p.createDocumentation();
  }
  console.log('finished creating documentation');
})()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err.stack);
    process.exit(0);
  });
