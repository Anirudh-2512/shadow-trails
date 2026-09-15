import 'dotenv/config'; // not present in client; read client/.env manually
import { readFileSync } from 'node:fs';

const env = readFileSync('../client/.env', 'utf8');
const token = env.match(/VITE_MAPBOX_TOKEN=(\S+)/)[1];

const style = await fetch(
  `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`
).then((r) => r.json());

console.log('root keys:', Object.keys(style));
console.log('layers with name:', style.layers.filter((l) => 'name' in l).length);
console.log('sources:', Object.keys(style.sources || {}));
const srcNames = Object.values(style.sources || {}).map((s) => Object.keys(s));
console.log('source keys sample:', srcNames[0]);
process.exit(0);
