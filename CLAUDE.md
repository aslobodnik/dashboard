# Dashboard Project

Personal dashboard at `dashboard.slobo.xyz` - DoorDash "recovery tracker" with tongue-in-cheek sobriety counter vibes.

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind
- Hosting: Vercel (auto-deploys from GitHub)
- Future: Cloudflare D1 for database

## Current State
- Live at `dashboard.slobo.xyz`
- Giant live HH:MM:SS count-up timer since last order
- GitHub-style 30-day activity grid (order frequency visualization)
- Whimsical messages based on time since last order
- 21 orders with timestamps (Nov 4 - Dec 28, 2025)
- Data stored in `data/orders.json` with date + time fields

## Project Structure
```
/src/app/page.tsx      - main dashboard page (timer, activity grid, stats)
/src/app/globals.css   - custom animations (scanlines, vignette, glow effects)
/data/orders.json      - order data with timestamps
```

## Key Commands
```bash
npm run dev          # start dev server
npm run build        # build for production
```

## Next Steps

### 1. Better Data Ingestion (Priority)
Current method (scraping DoorDash) is tedious. Explore alternatives:
- **DoorDash data export** - check if they offer CSV/JSON export in account settings
- **Gmail integration** - DoorDash sends order confirmation emails; could parse these
  - Gmail API to fetch emails from DoorDash
  - Extract order details (restaurant, total, timestamp) from email body
- **DoorDash API** - unlikely to be public, but worth checking

### 2. Future Enhancements
- Cloudflare D1 for persistent storage
- Auto-refresh data via scheduled function
- Add more widgets (other fun data to track)
