import * as _fs from 'fs';
const fs = _fs.promises;
console.log(process.argv);
const input = process.argv[2];
const output = process.argv[3];
if(!input || ! output) {
  console.log('wrong input or output');
} else {
  fs.readFile(input, {encoding: 'utf8'}).then(res => {
    const lines = res.split('\n');
    const words = lines.map(it => {
      return it.slice(0, it.indexOf(' '));
    }).filter(it => it.trim()).filter(it => it.length > 1);
    fs.writeFile(output, words.join('\n'));
  })
}


