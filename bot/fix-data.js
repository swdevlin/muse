"use strict";

const path = require('path');
const fs = require("fs");
const YAML = require("yaml");
require('dotenv').config({ path: path.resolve(__dirname, './.env') });


;(async () => {
  const personalities = require("./personalities");
  for (const k of Object.keys(personalities)) {
    const p = new personalities[k]();
    if (!p.constructor.id)
      continue;
    const basePath = path.resolve(__dirname, '../personalities/', p.constructor.data);
    const fixedPath = path.resolve(basePath, 'fixed/');
    if (!fs.existsSync(fixedPath)){
      fs.mkdirSync(fixedPath);
    }

    const files = fs.readdirSync(basePath);

    const yamlFiles = files.filter(function (file) {
      return path.extname(file) === ".yaml";
    });

    for (const name of yamlFiles) {
      let file = fs.readFileSync(path.resolve(basePath, name), 'utf8');
      const y = YAML.parse(file);
      for (const topic of Object.keys(y)) {
        const entry = y[topic];
        y[entry.title] = entry;
        delete entry.title;
        delete y[topic];
      }
      const fixed = path.resolve(fixedPath, name);
      fs.writeFileSync(fixed, YAML.stringify(y, {lineWidth: 80}));
    }
  }
  console.log('finished fixing data');
})()
  .then(res => process.exit(0))
  .catch(err => {
    console.log(err.stack);
    process.exit(0);
  });
