// Deterministic, no-model check of e2e's "read off the screen" rule (derivedReason).
// Not public API: nightly exposes it as @e2e-dev/core/lib/agent/derived (./lib/*),
// 0.23.1 bundles it, unexported, at e2e/dist/agent/derived.js.
// Exit 1 = bug present (a single digit of an on-screen code is not flagged); exit 2 = setup error.
import { readFileSync } from 'node:fs';

process.on('uncaughtException', (err) => { console.error(err); process.exit(2); });
const version = JSON.parse(readFileSync(new URL('./node_modules/e2e/package.json', import.meta.url), 'utf8')).version;
let mod, from;
try {
  mod = await import('@e2e-dev/core/lib/agent/derived');
  from = '@e2e-dev/core/lib/agent/derived';
} catch {
  mod = await import(new URL('./node_modules/e2e/dist/agent/derived.js', import.meta.url));
  from = 'e2e/dist/agent/derived.js';
}
const { derivedReason } = mod;

const code = '482913';
const shown = [`Your code is ${code}`];
// What the web engine reports for <input autocomplete="one-time-code"> on a real `type` action.
// Released versions ignore it; a fix may use it.
const evidence = { shown, inputPurpose: 'one-time-code' };
const goal = 'type the code shown on the page into the code boxes, one digit per box';

console.log(`e2e ${version} · derivedReason from ${from}`);
console.log(`evidence: ${JSON.stringify(evidence)}`);
console.log(`whole code ${code} -> ${derivedReason(code, goal, undefined, evidence)}`);
let missed = 0;
for (const [i, digit] of [...code].entries()) {
  const reason = derivedReason(digit, goal, undefined, evidence);
  if (reason === undefined) missed++;
  console.log(`box ${i + 1} digit ${digit} -> ${reason}`);
}
console.log(missed ? `BUG: ${missed} of ${code.length} digits replay as recorded` : 'OK: every digit is a gap');
process.exit(missed ? 1 : 0);
