const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const YAML = require('yaml');

const version = '0.4';

const files = fs.readdirSync(path.resolve(__dirname, './data/'));

const yamlFiles = files.filter(function (file) {
    return path.extname(file) === ".yaml";
});

let muse = {};

for (const name of yamlFiles) {
    let file = fs.readFileSync( path.resolve(__dirname, 'data', name), 'utf8');
    const y = YAML.parse(file);
    muse = Object.assign(muse, y);
}

muse['muse'].text += ` I am version ${version}.`;

module.exports = muse;