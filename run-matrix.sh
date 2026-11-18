#!/usr/bin/env bash
# Per channel (e2e latest, nightly): the no-model check, then record + replay of the OTP test.
# Usage: ./run-matrix.sh                                        # check only
#        AI_GATEWAY_API_KEY=... ./run-matrix.sh                  # check + agent runs (or GOOGLE_GENERATIVE_AI_API_KEY)
set -uo pipefail
cd "$(dirname "$0")"

versions() {  # e2e and @e2e-dev/web pinned per channel (bash 3 friendly: no assoc arrays)
  case "$1" in
    latest)  echo "0.23.1 0.16.0" ;;
    nightly) echo "0.23.2-nightly-20261118030221 0.16.1-nightly-20261118030221" ;;
  esac
}

# Optional "branch" channel: a locally built e2e checkout, e.g. E2E_FORK=/path/to/e2e
CHANNELS="latest nightly${E2E_FORK:+ branch}"

for channel in $CHANNELS; do
  if [ "$channel" = branch ]; then
    npm install --no-save --silent "$E2E_FORK/packages/e2e" "$E2E_FORK/packages/web" "$E2E_FORK/packages/core"
  else
    read -r e2e_v web_v <<<"$(versions "$channel")"
    npm install --no-save --silent "e2e@$e2e_v" "@e2e-dev/web@$web_v"
  fi
  mkdir -p "results/$channel"
  echo "== $channel check"
  npm run -s check >"results/$channel/check.txt" 2>&1
  echo "   exit $? ($(tail -1 "results/$channel/check.txt"))"
  [ -n "${AI_GATEWAY_API_KEY:-}${GOOGLE_GENERATIVE_AI_API_KEY:-}" ] || { echo "   no AI_GATEWAY_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY: skipping agent runs"; continue; }
  rm -rf .e2e/cache                                   # each channel records from scratch
  for run in 1 2; do                                  # 1 = record, 2 = replay
    out="results/$channel/run$run"; mkdir -p "$out"
    echo "== $channel ($(npx e2e --version)) run $run"
    npx e2e run tests/otp.e2e.ts --debug >"$out/console.log" 2>&1
    echo "   exit $?"
    cp .e2e/report.json "$out/" 2>/dev/null
    cp .e2e/results/*/trace.md "$out/" 2>/dev/null
    cp .e2e/cache/*.json "$out/" 2>/dev/null
    grep -E "Tests |AI |Cache " "$out/console.log" | sed 's/^/   /'
  done
done
npm install --no-save --silent e2e@0.23.1 @e2e-dev/web@0.16.0   # leave latest installed
