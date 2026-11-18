# e2e: a one-time code typed one digit per box replays the old code

One page with six `<input maxlength=1 autocomplete="one-time-code">` boxes and a code that changes on every load.
e2e checks each typed digit on its own against the screen. A single digit never matches the code shown, so the
recording keeps the digits as plain input and the next run types the previous code.

## 30-second check (no model, no browser)

```bash
npm install
npm run check   # exit 1 = bug, exit 0 = fixed
```

On e2e 0.23.1 and nightly `0.23.2-nightly-20261118030221`:

```
whole code 482913 -> minted-token
box 1 digit 4 -> undefined
...
box 6 digit 3 -> undefined
BUG: 6 of 6 digits replay as recorded
```

`check.mjs` calls `derivedReason` directly, with the `inputPurpose` the web engine reports for these boxes. It is not
public API: nightly exposes it as `@e2e-dev/core/lib/agent/derived`, and 0.23.1 bundles it at `e2e/dist/agent/derived.js`.
Exit 2 means a setup error.

## End to end with an agent

Either key works: `AI_GATEWAY_API_KEY` (model `openai/gpt-6-luna-fast`, or set `E2E_MODEL`), or `GOOGLE_GENERATIVE_AI_API_KEY`
(`gemini-flash-lite-latest`). Chromium is installed on the first run if missing.

```bash
AI_GATEWAY_API_KEY=... npx e2e run   # run 1 records six `type` actions
AI_GATEWAY_API_KEY=... npx e2e run   # run 2 types run 1's code: "Incorrect code", then agent-concluded / end-mismatch
```

## Against a fix branch

```bash
# in an e2e checkout: pnpm install && pnpm build
E2E_FORK=/path/to/e2e ./run-matrix.sh   # check + both runs on latest, nightly, and the checkout
```

Results go to `results/<channel>/`. With the fix, `check` exits 0 and run 1 records six `minted-token` gaps, so run 2 types no stale digit.
