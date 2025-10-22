# Price History Tracker - Frontend

A Next.js-based frontend application for tracking product prices across different e-commerce platforms.

## Features

- **Product Management**
  - Add products manually or by URL (auto-fetch product details)
  - View all tracked products with detailed information
  - Filter products by availability (In Stock/Out of Stock)
  - Search products by name or domain

- **Price Tracking**
  - Visual price history charts
  - Current price vs target price comparison
  - Price change indicators
  - Highest and lowest price tracking

- **Scheduler Control**
  - Start/stop automatic price checking
  - Configure check frequency with cron expressions
  - Manual price check trigger
  - Real-time scheduler status

- **Dashboard Analytics**
  - Total products tracked
  - Products that met target price
  - In-stock product count

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.2.0 + TailwindCSS 4.1.15
- **Language**: TypeScript 5.9.3
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running (default: http://localhost:3000)

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
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
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
│   ├── AddProductForm.tsx   # Form to add products
│   ├── ProductCard.tsx      # Product display card
│   └── SchedulerControl.tsx # Scheduler management
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
Two modes for adding products:
- **URL Mode**: Paste URLs to auto-fetch product details
- **Manual Mode**: Enter product details manually

### SchedulerControl
Manages automatic price checking:
- Start/stop scheduler
- Configure check frequency
- Trigger manual checks
- View scheduler status

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

## Features by File

- **`lib/api.ts`**: API client with TypeScript types, product and scheduler endpoints
- **`components/ProductCard.tsx`**: Product visualization with price history chart
- **`components/AddProductForm.tsx`**: Dual-mode product addition (URL/Manual)
- **`components/SchedulerControl.tsx`**: Cron-based scheduler management
- **`app/page.tsx`**: Main dashboard with stats, filters, and product list

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

This project is part of the Price History Tracker system.
