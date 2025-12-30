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

## Data Ingestion

### GraphQL API Method (Recommended)
DoorDash uses a GraphQL API we can query directly while logged in:

```
/scripts/fetch-doordash-orders.js
```

**To fetch new orders:**
1. Open doordash.com in browser and ensure logged in
2. Open browser console (or use Claude's `javascript_tool`)
3. Paste/run the script from `scripts/fetch-doordash-orders.js`
4. Copy the JSON output to `data/orders.json`

**Endpoint:** `https://www.doordash.com/graphql/getConsumerOrdersWithDetails`

The script:
- Uses session cookies for auth (no credentials needed)
- Paginates through all orders automatically
- Transforms to our `orders.json` format
- Sorts newest first

### Alternative Methods
- **Gmail integration** - parse order confirmation emails via Gmail API
- **DoorDash data export** - check account settings for CSV/JSON export

## Future Enhancements
- Cloudflare D1 for persistent storage
- Auto-refresh data via scheduled function
- Add more widgets (other fun data to track)
