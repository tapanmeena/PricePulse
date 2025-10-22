# PricePulse – Myntra Price Tracker

PricePulse is a polished Next.js frontend that helps you monitor real Myntra catalogue items, surface historical price swings, and react before the next discount disappears. Pair it with the companion Express API to queue URLs, scrape pricing, and visualise trends within a responsive dashboard.

## Features

- **Multi-URL intake** – paste up to 10 Myntra (or compatible marketplace) URLs at once and queue them for scraping.
- **Smart catalogue** – search by product or domain, filter by availability state, and open the store listing in a click.
- **Insightful charts** – Shadcn area charts with yearly-tooltips, min/max markers, and resilient styling for flat price histories.
- **Price intelligence** – lowest/highest badges, target price checks, and quick facts for availability and last-checked timestamps.
- **Accessible feedback** – optimistic loaders, keyboard shortcuts (⌘/Ctrl + K search), and responsive layouts tuned for mobile.

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.2.0 + TailwindCSS 4.1.15
- **Language**: TypeScript 5.9.3
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+
- PricePulse backend API running (default: http://localhost:3001)

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd price-history-tracker
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
  Edit `.env.local` and set your backend API URL:
   ```
  NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
price-history-tracker/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── AddProductForm.tsx   # Multi-URL submission form
│   ├── ProductCard.tsx      # Price snapshot and quick stats
│   └── SchedulerControl.tsx # Optional scheduler controls (hidden by default)
├── lib/
│   └── api.ts               # API client and types
├── public/                  # Static assets
├── .env.local              # Environment variables
└── package.json
```

## API Integration

The frontend integrates with the following backend endpoints:

### Products API (`/api/products`)
- `GET /` - Fetch all products
- `POST /` - Create product manually
- `POST /url` - Create product(s) by URL

### Scheduler API (`/api/schedule`)
- `POST /start` - Start price checker
- `POST /stop` - Stop price checker
- `GET /status` - Get scheduler status
- `POST /check-now` - Trigger manual price check

## Components

### ProductCard
Displays individual product information including:
- Product image, name, and URL
- Current price with change indicator
- Target price status
- Price history visualization
- Availability status

### AddProductForm
- Paste up to 10 URLs (newline or comma separated) and queue them in a single request
- Automatic deduplication and submission progress feedback

### SchedulerControl
- Optional panel to drive the backend scheduler (disabled in the public demo)

## Customization

### Styling
The application uses TailwindCSS with dark mode support. Modify styles in:
- `app/globals.css` - Global styles
- Component files - Component-specific styles

### API Configuration
Update the API base URL in `.env.local`:
```
NEXT_PUBLIC_API_URL=your-api-url
```

# Example Product

Use any live Myntra URL to test the flow. For instance:

- `https://www.myntra.com/sneakers/adidas/originals-men-white-forum-low-sneakers/25977822/buy`

Paste the link into the "Track new products" widget, wait for the loader to finish, and PricePulse will render the product card and chart once the backend scrape completes.

## Features by File

- `lib/api.ts`: API client with TypeScript types, product and scheduler endpoints
- `components/ProductCard.tsx`: Product visualization with price history chart and inline loaders
- `components/AddProductForm.tsx`: Multi-URL product submission with optimistic states
- `components/SchedulerControl.tsx`: Cron-based scheduler management (optional)
- `app/page.tsx`: Main dashboard with stats, filters, loaders, and product list

## Development

```bash
# Run development server with Turbopack
pnpm dev

# Run linter
pnpm lint

# Build for production
pnpm build
```

## License

This project is part of the PricePulse price-tracking suite.
