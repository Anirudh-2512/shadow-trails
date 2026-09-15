import { readFileSync } from 'node:fs';

const env = readFileSync('../client/.env', 'utf8');
const token = env.match(/VITE_MAPBOX_TOKEN=(\S+)/)[1];
const style = await fetch(
  `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`
).then((r) => r.json());

console.log('projection:', JSON.stringify(style.projection));
console.log('fog:', JSON.stringify(style.fog).slice(0, 120));
console.log('sprite:', JSON.stringify(style.sprite || style.sprite));
console.log('visibility:', style.visibility);
console.log('terrain:', style.terrain);
process.exit(0);
