#!/bin/bash
# geopulse-publish — git commit & push updated data to GitHub Pages
# Called by cron after data collection.

set -e
REPO_DIR="/Users/macmini_j/geopulse-dashboard"
cd "$REPO_DIR"

# Only commit if there are actual changes
CHANGED=$(git status --porcelain -- 'data/' 'lang/' 2>/dev/null | head -20)
if [ -z "$CHANGED" ]; then
    echo "  ℹ No data changes to publish"
    exit 0
fi

git add -A
git commit -m "data: auto-update $(date '+%Y-%m-%d %H:%M')"
git push origin main 2>&1
echo "  ✓ Published to GitHub Pages"
