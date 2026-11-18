# e2e: a one-time code typed one digit per box replays the old code

One page with six `<input maxlength=1 autocomplete="one-time-code">` boxes and a code that changes on every load.
e2e checks each typed digit on its own against the screen. A single digit never matches the code shown, so the
recording keeps the digits as plain input and the next run types the previous code.

## No-model check

```bash
npm install
npm run check
```

Expected output on e2e 0.23.1 and on nightly `0.23.2-nightly-20261118030221` (exit code 1):

```
evidence: {"shown":["Your code is 482913"],"inputPurpose":"one-time-code"}
whole code 482913 -> minted-token
box 1 digit 4 -> undefined
...
box 6 digit 3 -> undefined
BUG: 6 of 6 digits replay as recorded
```

`check.mjs` calls `derivedReason` directly, with the `inputPurpose` the web engine reports for these boxes. It is not public API: nightly exposes it as
`@e2e-dev/core/lib/agent/derived`, and 0.23.1 bundles it at `e2e/dist/agent/derived.js`.
Exit 0 means every digit is a gap (fixed), 1 means the bug, 2 means a setup error.

## With an agent

```bash
GOOGLE_GENERATIVE_AI_API_KEY=... npx e2e run   # run 1 records
GOOGLE_GENERATIVE_AI_API_KEY=... npx e2e run   # run 2 replays the old digits: "Incorrect code" before the agent recovers
```

`./run-matrix.sh` runs the check on both e2e latest and nightly, then both agent runs on each when the key is set.
Results go to `results/<channel>/`. `E2E_FORK=/path/to/e2e ./run-matrix.sh` adds a `branch`
channel built from a local checkout (`pnpm install && pnpm build` there first).
