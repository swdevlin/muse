const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const YAML = require('yaml');

const version = '0.3';

const keyJoin = (obj) => {
    return Object.keys(obj).join(', ');
}

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

const files = fs.readdirSync(path.resolve(__dirname, './data/'));

const yamlFiles = files.filter(function (file) {
    return path.extname(file) === ".yaml" && path.basename(file) !== 'muse.yaml';
});

let file = fs.readFileSync( path.resolve(__dirname, './data/muse.yaml'), 'utf8');
let muse = YAML.parse(file);

for (const name of yamlFiles) {
    let file = fs.readFileSync( path.resolve(__dirname, 'data', name), 'utf8');
    const y = YAML.parse(file);
    if (y.hasOwnProperty('entries')) {
        muse = Object.assign(muse, y.entries);
        let t = y.text.trim();
        muse[y.topic] = {
            title: y.title,
            text: `${t} ${keyJoin(y.entries)}`
        }
    } else
        muse = Object.assign(muse, y);
}

muse['muse'].text += ` I am version ${version}.`;

module.exports = muse;
