# Dashboard Project

Personal dashboard at `dashboard.slobo.xyz` - started with DoorDash "days since" tracker, expandable for more widgets.

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind
- Hosting: Vercel
- Future: Cloudflare D1 for database

## Current State
- MVP complete and working locally (`npm run dev`)
- 76 orders scraped from DoorDash (Jun-Dec 2025)
- Data stored in `data/orders.json`
- GitHub repo created and pushed (public)

## Remaining Tasks
1. **Deploy to Vercel** - import GitHub repo at vercel.com/new, add domain `dashboard.slobo.xyz`
2. **Cloudflare D1** (optional/later) - for dynamic data updates
3. **Add more widgets** - other fun data to track

## Project Structure
```
/src/app/page.tsx    - main dashboard page
/data/orders.json    - scraped DoorDash order data
```

## Key Commands
```bash
npm run dev          # start dev server
npm run build        # build for production
```

## Data Refresh
To update order data, use Claude Chrome extension to scrape DoorDash orders page and update `data/orders.json`.
