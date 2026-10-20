#!/usr/bin/env bash
# Builds sample workbooks for several scenarios and checks every formula against LibreOffice's own calculation.
# usage: scripts/verify-xlsx.sh OUTDIR
set -u
OUT=${1:-/tmp/xl}; mkdir -p "$OUT"; cd "$(dirname "$0")/.."
run() { # name lang month empty hourly
  d="$OUT/$1"; rm -rf "$d"; mkdir -p "$d/lo"
  npx tsx scripts/make-sample-xlsx.ts "$d" "$2" "$3" "$4" "$5" >/dev/null || { echo "$1: BUILD FAILED"; return; }
  (cd "$d" && timeout 120 soffice --headless --convert-to xlsx --outdir lo nocache.xlsx >/dev/null 2>&1)
  printf "%-12s " "$1"; python3 -W ignore scripts/cmp-xlsx.py "$d/cached.xlsx" "$d/lo/nocache.xlsx"
}
run sept en 2026-09 full hourly
run feb en 2026-02 full hourly
run oct-now en 2026-10 full hourly
run empty en 2026-09 empty hourly
run nohourly en 2026-09 full nohourly
run spanish es 2026-09 full hourly
run chinese zh 2026-09 full hourly
