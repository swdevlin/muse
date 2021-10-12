const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const YAML = require('yaml');

const version = '0.2';

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

let file = fs.readFileSync( path.resolve(__dirname, './data/muse.yaml'), 'utf8');
const m = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/skills.yaml'), 'utf8');
const skills = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/morphs.yaml'), 'utf8');
const morphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/bio-morphs.yaml'), 'utf8');
const bioMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/info-morphs.yaml'), 'utf8');
const infoMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/uplift-morphs.yaml'), 'utf8');
const upliftMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/synth-morphs.yaml'), 'utf8');
const synthMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/pod-morphs.yaml'), 'utf8');
const podMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, './data/aptitudes.yaml'), 'utf8');
const aptitudes = YAML.parse(file);

const campaignFile = path.resolve(__dirname, './campaign.yaml');
let campaign = {};
if (fs.existsSync(campaignFile)) {
    file = fs.readFileSync(campaignFile, 'utf8');
    campaign = YAML.parse(file);
}

const muse = Object.assign(
  {}, m,
  skills, aptitudes,
  morphs, bioMorphs, infoMorphs, upliftMorphs, synthMorphs, podMorphs,
  campaign
);
muse['skills'] = {title: 'Skills', text: 'The skills I know about are: ' + Object.keys(skills).join(', ')};
muse['aptitudes'] = {title: 'Aptitudes', text: 'Your aptitudes represent your natural, inherent abilities. There are 6 aptitude scores: ' + Object.keys(skills).join(', ')};
muse['biomorphs'].text += '\nCommon morphs are: ' + Object.keys(bioMorphs).join(', ');
muse['infomorphs'].text += '\nCommon morphs are: ' + Object.keys(infoMorphs).join(', ');
muse['podmorphs'].text += '\nCommon morphs are: ' + Object.keys(podMorphs).join(', ');
muse['synthmorphs'].text += '\nCommon morphs are: ' + Object.keys(synthMorphs).join(', ');
muse['upliftmorphs'].text += '\nCommon morphs are: ' + Object.keys(upliftMorphs).join(', ');
muse['muse'].text += ` I am version ${version}.`;

module.exports = muse;
