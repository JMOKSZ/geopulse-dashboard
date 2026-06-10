#!/usr/bin/env python3
"""
geopulse-update-data — Update a specific indicator value in layer JSON files.

Usage:
  python3 scripts/update-data.py <layer_id> <indicator_key> <field> <value>

Examples:
  python3 scripts/update-data.py layer1 straitThroughput value "<0.3 mb/d"
  python3 scripts/update-data.py layer1 straitThroughput trend falling
  python3 scripts/update-data.py layer2 centralBankGold value "China +15t (May)"
  python3 scripts/update-data.py layer3 tradeSurplus value "$108.2B"
"""

import json
import sys
import os
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_DIR / "data"

def usage():
    print(__doc__)
    sys.exit(1)

def main():
    if len(sys.argv) < 5:
        usage()

    layer_id = sys.argv[1]
    indicator_key = sys.argv[2]
    field = sys.argv[3]
    value = " ".join(sys.argv[4:])

    # Validate layer
    if layer_id not in ("layer1", "layer2", "layer3", "layer4", "layer5"):
        print(f"  ✗ Invalid layer: {layer_id}. Use layer1-layer5.")
        sys.exit(1)

    filepath = DATA_DIR / f"{layer_id}.json"
    if not filepath.exists():
        print(f"  ✗ File not found: {filepath}")
        sys.exit(1)

    # Read
    with open(filepath) as f:
        data = json.load(f)

    indicators = data.get("indicators", {})
    if indicator_key not in indicators:
        print(f"  ✗ Indicator '{indicator_key}' not found in {layer_id}")
        print(f"    Available: {', '.join(indicators.keys())}")
        sys.exit(1)

    # Update
    old_value = indicators[indicator_key].get(field, "(none)")
    indicators[indicator_key][field] = value

    # Write
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"  ✓ {layer_id}.json / {indicator_key}.{field}: '{old_value}' → '{value}'")
    return True

if __name__ == "__main__":
    main()
