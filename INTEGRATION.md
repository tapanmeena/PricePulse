# Price History Tracker - Full Stack Integration Guide

## Overview

This document explains how the frontend and backend work together in the Price History Tracker application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              (Next.js 15 + React 19)                         │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Dashboard  │  │   Product    │  │    Scheduler     │   │
│  │   (Stats)   │  │     Form     │  │     Control      │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                           │                                   │
│                    ┌──────┴───────┐                          │
│                    │   API Client  │                          │
│                    │   (lib/api.ts)│                          │
│                    └──────┬───────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                           ▼                                   │
│                    Express Server                             │
│              (Node.js + TypeScript)                           │
│                                                               │
│  ┌─────────────────┐           ┌──────────────────────┐     │
│  │  Product Routes │           │  Scheduler Routes    │     │
│  │  /api/products  │           │  /api/schedule       │     │
│  └────────┬────────┘           └──────────┬───────────┘     │
│           │                                │                  │
│  ┌────────▼────────┐           ┌──────────▼───────────┐     │
│  │    Product      │           │    Scheduler         │     │
│  │   Controller    │           │    Service           │     │
│  └────────┬────────┘           └──────────┬───────────┘     │
│           │                                │                  │
│  ┌────────▼────────┐           ┌──────────▼───────────┐     │
│  │    Product      │           │    Scraper           │     │
│  │    Service      │◄──────────┤    Service           │     │
│  └────────┬────────┘           └──────────────────────┘     │
│           │                                                   │
│           ▼                                                   │
│  ┌─────────────────┐                                         │
│  │  MongoDB Atlas  │                                         │
│  │  (Product Model)│                                         │
│  └─────────────────┘                                         │
└──────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Product Endpoints

#### 1. Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "url": "https://example.com/product",
      "domain": "example.com",
      "currentPrice": 999.99,
      "targetPrice": 899.99,
      "currency": "INR",
      "availability": "In Stock",
      "image": "https://example.com/image.jpg",
      "priceHistory": [
        { "price": 1099.99, "date": "2025-10-20T00:00:00.000Z" },
        { "price": 999.99, "date": "2025-10-22T00:00:00.000Z" }
      ],
      "createdAt": "2025-10-20T00:00:00.000Z",
      "updatedAt": "2025-10-22T00:00:00.000Z",
      "lastChecked": "2025-10-22T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 2. Create Product (Manual)
```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "url": "https://example.com/product",
  "currentPrice": 999.99,
  "targetPrice": 899.99,
  "image": "https://example.com/image.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { /* Product object */ }
}
```

#### 3. Create Product by URL (Auto-fetch)
```http
POST /api/products/url
Content-Type: application/json

{
  "urls": [
    "https://example.com/product1",
    "https://example.com/product2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Products created successfully",
  "data": [ /* Array of Product objects */ ]
}
```

### Scheduler Endpoints

#### 1. Start Scheduler
```http
POST /api/schedule/start
Content-Type: application/json

{
  "cronExpression": "0 */6 * * *"  // Every 6 hours
}
```

**Common Cron Expressions:**
- `0 */6 * * *` - Every 6 hours
- `0 */12 * * *` - Every 12 hours
- `0 0 * * *` - Daily at midnight
- `0 * * * *` - Every hour
- `*/30 * * * *` - Every 30 minutes

#### 2. Stop Scheduler
```http
POST /api/schedule/stop
```

#### 3. Get Scheduler Status
```http
GET /api/schedule/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isRunning": true
  }
}
```

#### 4. Trigger Manual Price Check
```http
POST /api/schedule/check-now
```

## Data Flow Examples

### Adding a Product by URL

1. **User Action**: User enters URL in AddProductForm
2. **Frontend**: Calls `productApi.createProductByUrl(['url'])`
3. **Backend**: 
   - Receives POST request at `/api/products/url`
   - Scraper service fetches product details from URL
   - Extracts name, price, image, availability
   - Creates product in MongoDB
4. **Response**: Returns created product to frontend
5. **Frontend**: Updates product list and shows success message

### Automatic Price Checking Flow

1. **Scheduler Start**: User starts scheduler with cron expression
2. **Backend**: 
   - Cron job runs at specified intervals
   - Fetches all products from database
   - For each product:
     - Scrapes current price from URL
     - Compares with stored price
     - Updates price history if changed
     - Updates currentPrice field
3. **Next Frontend Fetch**: Dashboard shows updated prices and history

### Manual Price Check

1. **User Action**: Clicks "Check Prices Now" button
2. **Frontend**: Calls `schedulerApi.checkNow()`
3. **Backend**: 
   - Immediately runs price check for all products
   - Updates database with new prices
4. **Frontend**: User clicks refresh to see updated prices

## Frontend Components

### 1. Dashboard (app/page.tsx)
- Main application page
- Displays statistics (total products, target met, in stock)
- Contains AddProductForm and SchedulerControl
- Shows filtered product list
- Handles product search and filtering

### 2. ProductCard (components/ProductCard.tsx)
- Displays individual product information
- Shows price history as mini bar chart
- Indicates if target price is met
- Shows price change indicators (up/down)
- Links to product URL

### 3. AddProductForm (components/AddProductForm.tsx)
- Two modes: URL (auto-fetch) or Manual entry
- URL mode: Paste one or more URLs, backend scrapes details
- Manual mode: Enter all details manually
- Form validation and error handling
- Success/error message display

### 4. SchedulerControl (components/SchedulerControl.tsx)
- Shows scheduler running status (green/red indicator)
- Cron expression presets
- Start/Stop scheduler buttons
- Manual "Check Now" button
- Real-time status updates

## Backend Services

### 1. Product Service (productService.ts)
- `createProduct()`: Create product with manual data
- `createProductByUrl()`: Auto-fetch and create product
- `getAllProducts()`: Retrieve all products
- Handles database operations

### 2. Scraper Service (scraperService.ts)
- Fetches product pages
- Extracts product details (name, price, image, availability)
- Parses different e-commerce site formats
- Returns structured product data

### 3. Scheduler Service (schedulerService.ts)
- `startPriceChecker()`: Start cron job
- `stopPriceChecker()`: Stop cron job
- `isRunning()`: Check scheduler status
- `triggerManualPriceCheck()`: Run price check immediately
- Uses node-cron for scheduling

## Environment Configuration

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Backend (.env)
```bash
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/price-tracker
```

## Running the Full Stack

### 1. Start Backend
```bash
cd price-tracker-backend
pnpm install
pnpm dev
# Backend runs on http://localhost:3001
```

### 2. Start Frontend
```bash
cd price-history-tracker
pnpm install
pnpm dev
# Frontend runs on http://localhost:3000
```

### 3. Access Application
- Open browser to http://localhost:3000
- Add products using URL or manual entry
- Configure scheduler for automatic price checking
- Monitor price changes and trends

## Key Features

### Price Tracking
- Automatic price history recording
- Visual price trend charts
- Price change notifications
- Target price alerts

### Product Management
- Auto-fetch product details from URLs
- Manual product entry
- Product search and filtering
- Availability tracking

### Scheduler Management
- Flexible scheduling with cron expressions
- Start/stop controls
- Manual price checks
- Status monitoring

### Data Visualization
- Price history charts
- Statistics dashboard
- Highest/lowest price indicators
- Price change percentages

## Error Handling

### Frontend
- API call errors shown in UI
- Form validation errors
- Network error handling
- Loading states during API calls

### Backend
- Duplicate product detection
- Scraping error handling
- Database error handling
- Invalid input validation

## Future Enhancements

1. **Price Alerts**: Email/push notifications when target price is met
2. **Advanced Charts**: Detailed price history graphs with Chart.js
3. **Product Categories**: Organize products by category
4. **Price Comparison**: Compare prices across different stores
5. **Export Data**: Export price history as CSV/JSON
6. **User Authentication**: Multi-user support with accounts
7. **Mobile App**: React Native mobile application
8. **Price Predictions**: ML-based price prediction
9. **Deal Detection**: Identify best deals based on price history
10. **Wishlist Sharing**: Share tracked products with others

## Troubleshooting

### Frontend not connecting to backend
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running on correct port
- Check CORS settings in backend

### Products not being scraped
- Verify URL is accessible
- Check scraper service supports the domain
- Review scraper logs for errors

### Scheduler not running
- Check cron expression is valid
- Verify scheduler was started
- Check backend logs for errors

### Price history not updating
- Ensure scheduler is running
- Check if product URLs are still valid
- Verify database connection

## Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure MongoDB connection is working
5. Test API endpoints directly using curl/Postman