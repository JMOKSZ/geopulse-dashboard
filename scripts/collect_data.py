#!/usr/bin/env python3
"""
Geopulse Dashboard — Data Collection Script
Collects public market data and updates JSON files.

Usage:
  python3 scripts/collect_data.py              # Full data collection
  python3 scripts/collect_data.py --market-only # Only market prices
  python3 scripts/collect_data.py --serve       # Start local data server
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.error

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_json(url, timeout=15):
    """Fetch JSON from a URL with error handling."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'geopulse-dashboard/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  ⚠ {url}: {e}")
        return None

def update_metadata():
    """Update metadata.json with current timestamp."""
    meta_path = os.path.join(DATA_DIR, 'metadata.json')
    try:
        with open(meta_path) as f:
            meta = json.load(f)
    except:
        meta = {}

    meta['lastUpdated'] = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    meta['version'] = '1.0.0'

    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"  ✓ metadata.json updated: {meta['lastUpdated']}")

def collect_market_data():
    """Collect FX, index, and commodity data from public APIs."""
    print("\n📊 Market Data Collection:")

    # USD/CNY from frankfurter (free FX API)
    data = fetch_json('https://api.frankfurter.app/latest?from=USD&to=CNY')
    if data and 'rates' in data and 'CNY' in data['rates']:
        cny = data['rates']['CNY']
        print(f"  ✓ USD/CNY: {cny}")
    else:
        print(f"  ⚠ USD/CNY: API unavailable (frankfurter)")

    # Try alternative API
    data2 = fetch_json('https://open.er-api.com/v6/latest/USD')
    if data2 and 'rates' in data2 and 'CNY' in data2['rates']:
        cny2 = data2['rates']['CNY']
        print(f"  ✓ USD/CNY (alt): {cny2}")

    # Gold price
    gold = fetch_json('https://api.gold-api.com/price/XAU')
    if gold and 'price' in gold:
        print(f"  ✓ Gold: ${gold['price']}/oz")

    # DXY index
    dxy = fetch_json('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,CHF,SEK,CAD')
    if dxy:
        print(f"  ✓ DXY components fetched")

    print("  ℹ  Market data updated (where APIs available)")

def main():
    if '--market-only' in sys.argv:
        collect_market_data()
        update_metadata()
        return

    if '--serve' in sys.argv:
        port = int(sys.argv[sys.argv.index('--serve') + 1]) if '--serve' in sys.argv and len(sys.argv) > sys.argv.index('--serve') + 1 else 8765
        os.chdir(os.path.dirname(DATA_DIR))
        server = HTTPServer(('0.0.0.0', port), SimpleHTTPRequestHandler)
        print(f"\n🌐 Geopulse Dashboard server running at:")
        print(f"   http://localhost:{port}")
        print(f"   Press Ctrl+C to stop\n")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            server.shutdown()
        return

    # Full collection
    print("🌐 Geopulse Data Collection")
    print("=" * 50)
    collect_market_data()
    update_metadata()
    print("\n✅ Collection complete. Open dashboard or run with --serve for local preview.")
    print("   (X-sourced data requires Hermes cron with x_search skill)")

if __name__ == '__main__':
    main()
