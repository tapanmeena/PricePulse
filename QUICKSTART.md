# Quick Start Guide

Get your Price History Tracker up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- pnpm installed (`npm install -g pnpm`)

## Step 1: Backend Setup

1. Navigate to backend directory:
   ```bash
   cd price-tracker-backend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create `.env` file:
   ```bash
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Start the backend:
   ```bash
   pnpm dev
   ```

   You should see:
   ```
   Server is running on http://192.168.x.x:3001
   Connected to MongoDB
   ```

## Step 2: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd price-history-tracker
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the frontend:
   ```bash
   pnpm dev
   ```

   You should see:
   ```
   ▲ Next.js 15.5.6
   - Local:        http://localhost:3000
   ```

## Step 3: Use the Application

1. Open your browser to http://localhost:3000

2. Add your first product:
   - Click "By URL (Auto-fetch)" mode
   - Paste a product URL (e.g., Amazon, Flipkart)
   - Click "Add Products"
   - Wait for the product details to be fetched

3. Set up the scheduler:
   - Select check frequency (e.g., "Every 6 hours")
   - Click "Start Scheduler"
   - The system will now check prices automatically

4. Monitor prices:
   - View all tracked products on the dashboard
   - See price history charts
   - Filter by availability
   - Search by product name

## Common Commands

### Backend
```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Run production server
```

### Frontend
```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Run production server
pnpm lint     # Run linter
```

## Testing the API

Test backend endpoints directly:

```bash
# Get all products
curl http://localhost:3000/api/products

# Add product by URL
curl -X POST http://localhost:3000/api/products/url \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com/product"]}'

# Get scheduler status
curl http://localhost:3000/api/schedule/status

# Trigger manual price check
curl -X POST http://localhost:3000/api/schedule/check-now
```

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify MongoDB connection string
- Ensure all dependencies are installed

### Frontend won't start
- Check if port 3000 is available (or use different port)
- Verify `.env.local` is created
- Clear `.next` folder and rebuild: `rm -rf .next && pnpm dev`

### Products not loading
- Ensure backend is running
- Check NEXT_PUBLIC_API_URL in `.env.local`
- Open browser console for errors

### Scraping fails
- Verify the product URL is accessible
- Check if the site blocks automated requests
- Try with a different product URL

## Next Steps

1. **Customize Scheduling**: Adjust cron expressions for your needs
2. **Add Target Prices**: Set target prices to get notified of deals
3. **Explore Filters**: Use search and filters to organize products
4. **Check Price History**: View price trends over time

## Need Help?

- Check `INTEGRATION.md` for detailed architecture
- Review `README.md` for feature documentation
- Check browser console and terminal logs for errors

Happy tracking! 🎉