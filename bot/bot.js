const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const YAML = require('yaml');

const Discord = require('discord.js');
const discordClient = new Discord.Client();

const version = '0.2';

const muse_prefix = process.env.MUSE_PREFIX || 'muse';

let file = fs.readFileSync( path.resolve(__dirname, '../data/muse.yaml'), 'utf8');
const m = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/skills.yaml'), 'utf8');
const skills = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/morphs.yaml'), 'utf8');
const morphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/bio-morphs.yaml'), 'utf8');
const bioMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/info-morphs.yaml'), 'utf8');
const infoMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/uplift-morphs.yaml'), 'utf8');
const upliftMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/synth-morphs.yaml'), 'utf8');
const synthMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/pod-morphs.yaml'), 'utf8');
const podMorphs = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../data/aptitudes.yaml'), 'utf8');
const aptitudes = YAML.parse(file);

file = fs.readFileSync(path.resolve(__dirname, '../campaign.yaml'), 'utf8');
const campaign = YAML.parse(file);

const muse = Object.assign(
  {}, m,
  skills, aptitudes,
  morphs, bioMorphs, infoMorphs, upliftMorphs, synthMorphs, podMorphs,
  campaign
);
muse['skills'] = {title: 'Skills', text: 'This list of skills I know about is: ' + Object.keys(skills).join(', ')};
muse['aptitudes'] = {title: 'Aptitudes', text: 'Your aptitudes represent your natural, inherent abilities. There are 6 aptitude scores: ' + Object.keys(skills).join(', ')};
muse['biomorphs'].text += '\nCommon morphs are: ' + Object.keys(bioMorphs).join(', ');
muse['infomorphs'].text += '\nCommon morphs are: ' + Object.keys(infoMorphs).join(', ');
muse['podmorphs'].text += '\nCommon morphs are: ' + Object.keys(podMorphs).join(', ');
muse['synthmorphs'].text += '\nCommon morphs are: ' + Object.keys(synthMorphs).join(', ');
muse['upliftmorphs'].text += '\nCommon morphs are: ' + Object.keys(upliftMorphs).join(', ');
muse['muse'].text += ` I am version ${version}.`;

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
    'what about ',
    'tell me about ',
    'do you know about ',
    'what do you know about ',
];

discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
});

const sendEntry = async (msg, muse) => {
    const text = `**${muse.title}**\n${muse.text}`;
    await msg.reply(text);
}

discordClient.on('message', async msg => {
    // ignore our own messages
    if (`${msg.author.username}#${msg.author.discriminator}` === discordClient.user.tag)
        return;

    const tokens = msg.content.split(' ');
    if (tokens < 2)
        return;
    if (!muse_prefix.startsWith(tokens[0]))
        return;

    if (tokens.length === 2 && tokens[1] === 'configure') {
        if (!msg.member.permissions.has('MANAGE_GUILD')) {
            await msg.reply('Failure on InfoSec test');
            return;
        }
        // Do something about the
    }

    const {id: author_id} = msg.author;
    const {guild} = msg.channel;
    const {id: guild_id} = guild;
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
        console.log(err);
        await msg.reply(err);
    } finally {
        console.log(`${guild_id} ${author_id} ${msg.content}`);
    }
});

discordClient.login(process.env.DISCORD_TOKEN);
