const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const YAML = require('yaml');

const version = '0.2';

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

const keyJoin = (obj) => {
	return Object.keys(obj).join(', ');
}

const parseYaml = (yamlPath) => {
	if (fs.existsSync(yamlPath)) {
		let file = fs.readFileSync(path.resolve(__dirname, yamlPath), 'utf8');
		const parsed = YAML.parse(file);
		return parsed;
	}
	console.error(`cant find '${yamlPath}'`);
	if (yamlPath == "campaign.yaml") {
		console.info("You can make your own campaign by renaming `campaign.yaml.template` to `campaign.yaml`");
	}
	return null;
}

let museConfig = {
	m: './data/muse.yaml',
	skills: './data/skills.yaml',
	morphs: './data/morphs.yaml',
	bioMorphs: './data/bio-morphs.yaml',
	infoMorphs: './data/info-morphs.yaml',
	upliftMorphs: './data/uplift-morphs.yaml',
	synthMorphs: './data/synth-morphs.yaml',
	podMorphs: './data/pod-morphs.yaml',
	aptitudes: './data/aptitudes.yaml',
	wares: './data/ware.yaml',
	campaign: 'campaign.yaml'
};

const museData = {}
for (cfgKey in museConfig) {
	museData[cfgKey] = parseYaml(museConfig[cfgKey]);
}

const muse = Object.assign({}, ...Object.values(museData));

muse['skills'] = {title: 'Skills', text: 'The skills I know about are: ' + keyJoin(museData.skills)};
muse['aptitudes'] = {title: 'Aptitudes', text: 'Your aptitudes represent your natural, inherent abilities. There are 6 aptitude scores: ' + keyJoin(museData.aptitudes)};
muse['ware'] = {
    title: 'Aptitudes',
    text: `Ware is a catch-all category for augmentations of different kinds. Unless otherwise noted, each ware item can only be installed in the same morph once, no matter if it is available in different forms.`
};
muse['biomorphs'].text += '\nCommon morphs are: ' + keyJoin(museData.bioMorphs);
muse['infomorphs'].text += '\nCommon morphs are: ' + keyJoin(museData.infoMorphs);
muse['podmorphs'].text += '\nCommon morphs are: ' + keyJoin(museData.podMorphs);
muse['synthmorphs'].text += '\nCommon morphs are: ' + keyJoin(museData.synthMorphs);
muse['upliftmorphs'].text += '\nCommon morphs are: ' + keyJoin(museData.upliftMorphs);
muse['ware'].text += '\nAvailable augmentation wares are: ' + keyJoin(museData.wares);
muse['muse'].text += ` I am version ${version}.`;

console.log("Bot running...");

module.exports = muse;
