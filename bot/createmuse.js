const yaml = require('yaml');
const fs = require('fs');
const readline = require('readline');

let muse = {};

async function processLineByLine() {
  const fileStream = fs.createReadStream('./muse.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    const tokens = line.split(':');
    const title = tokens.shift();
    const text = tokens.join(':').trim();
    muse[title.toLocaleLowerCase()] = {
      title: title,
      text: text,
    }
  }

  let yamlStr = yaml.stringify(muse);
  fs.writeFileSync('muse.yaml', yamlStr, 'utf8');
}

processLineByLine();

