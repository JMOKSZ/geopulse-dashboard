#!/bin/bash
# Geopulse Dashboard — Update Script
# Usage: bash scripts/update.sh [--serve]

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "🌐 Geopulse Dashboard — Data Update"
echo "===================================="
echo ""

# 1. Collect market data from public APIs
echo "📡 Step 1: Collecting market data..."
python3 scripts/collect_data.py --market-only

# 2. Note about X data
echo ""
echo "📝 Step 2: X-sourced data requires Hermes cron"
echo "   Run 'hermes cron run geopulse-x-scrape' for fresh intelligence data"
echo "   Or wait for the daily automated cron job"
echo ""

# 3. Update timestamp
echo "⏱  Updating metadata..."
python3 -c "
import json
from datetime import datetime, timezone
meta_path = 'data/metadata.json'
try:
    with open(meta_path) as f: meta = json.load(f)
except: meta = {}
meta['lastUpdated'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
with open(meta_path, 'w') as f: json.dump(meta, f, indent=2, ensure_ascii=False)
print('  ✓ metadata.json timestamp updated')
"

echo ""
echo "✅ Update complete"

# Optionally start local server
if [[ "$1" == "--serve" ]]; then
    echo ""
    echo "🌐 Starting local dashboard server..."
    python3 -c "
import http.server, os
os.chdir('$DIR')
http.server.HTTPServer(('0.0.0.0', 8765), http.server.SimpleHTTPRequestHandler).serve_forever()
" 2>/dev/null &
    echo "   http://localhost:8765  (PID: $!)"
fi
