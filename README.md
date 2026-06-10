# Geopolitical Pulse / 地缘脉冲

**Real-time Geopolitical & Macro Monitoring Dashboard**

A five-layer observation framework for tracking the geopolitical game theory unfolding in 2026, built around the Strait of Hormuz crisis.

> **Framework Logic:** Hormuz disruption → Oil↑ → China manufacturing advantage↑ → Trade surplus↑ → Capital controls seal exits → RMB appreciates → Gold replaces Treasuries → Dollar share declines → Multi-polar system emerges.

---

## Dashboard

🌐 **GitHub Pages:** https://jmoksz.github.io/geopulse-dashboard

Or run locally:

```bash
# Start local server
python3 scripts/collect_data.py --serve

# Open in browser
open http://localhost:8765
```

---

## Architecture

### Five Layers of Observation

| Layer | Focus | Update Frequency |
|-------|-------|-----------------|
| **1 — Hormuz** | War risk premium, throughput, fleet position | Daily (X-sourced) |
| **2 — Dollar System** | Treasury auctions, gold purchases, SWIFT share | Weekly / Monthly |
| **3 — China Resilience** | Trade surplus, CFETS index, FX settlement | Monthly (official data) + Daily (CFETS) |
| **4 — AI & Tech** | GPU black market, AI adoption, NVDA revenue | Quarterly / Event-based |
| **5 — Wild Signals** | MBS itinerary, Singapore stance, HKMA | Weekly (monitoring) |

### Data Flow

```
Hermes Cron (x_search)     Public APIs (FX, Gold)      Manual Updates
        │                         │                         │
        ▼                         ▼                         ▼
    ┌─────────────────────────────────────────────────────────┐
    │                  data/*.json  (JSON files)              │
    └─────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌──────────────────────────────┐
              │   Static Dashboard (HTML/CSS/JS) │
              │   GitHub Pages or local server   │
              └──────────────────────────────┘
```

---

## Data Collection

### Automatic (Market Data)
```bash
python3 scripts/collect_data.py        # Collect all available market data
python3 scripts/collect_data.py --serve  # Start local preview server
```

### X-Sourced Data (via Hermes Cron)
X data (Kpler throughput, Vortexa tanker tracking, IRGC statements, central bank news) is collected by a daily Hermes cron job that uses `x_search` to query for updated indicators.

**To run manually:**
```bash
hermes cron run geopulse-x-daily
```

### Manual Data Updates
Some data (TIC, SWIFT, ADB) has 1-2 month publication lags and is updated when official releases land.

---

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — zero framework dependencies
- **Charts:** CSS-based indicators (status dots, trend arrows)
- **i18n:** JSON translation files (EN/中文)
- **Data:** JSON files in `data/` directory
- **Hosting:** GitHub Pages (public) + local server (real-time)
- **Collection:** Python scripts + Hermes cron with x_search

---

## File Structure

```
├── index.html            # Main dashboard page
├── css/
│   └── style.css         # Full stylesheet
├── js/
│   └── app.js            # Application logic (i18n, data loading, UI)
├── lang/
│   ├── en.json           # English translations
│   └── zh.json           # 中文翻译
├── data/
│   ├── metadata.json     # Dashboard config + timestamps
│   ├── layer1.json       # Hormuz direct indicators
│   ├── layer2.json       # Dollar system indicators
│   ├── layer3.json       # China resilience indicators
│   ├── layer4.json       # AI & tech competition
│   └── layer5.json       # Wild signals
├── scripts/
│   ├── collect_data.py   # Market data collection + local server
│   └── update.sh         # Master update script
└── README.md
```

---

## Local Development

```bash
# Clone
git clone https://github.com/JMOKSZ/geopulse-dashboard.git
cd geopulse-dashboard

# Install (no deps — pure HTML/JS)
python3 scripts/collect_data.py --serve

# Edit and reload at http://localhost:8765
```

---

## Deployment

The site auto-deploys to GitHub Pages when pushed to `main`.

To update data on the live site:
1. Run data collection locally
2. Commit updated `data/*.json` files
3. Push to GitHub

---

## About

Built by James Mok & Hermes Agent. Data from public sources. Not investment advice.

**Update frequency:** Real-time (market data), Daily (X-sourced), Monthly (official statistics).
