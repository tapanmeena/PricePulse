// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface PriceHistory {
  price: number;
  date: string;
}

export interface Product {
  _id: string;
  name: string;
  image?: string;
  url: string;
  domain: string;
  currency: string;
  availability: string;
  currentPrice: number;
  targetPrice?: number;
  priceHistory?: PriceHistory[];
  createdAt: string;
  updatedAt: string;
  lastChecked?: string;
  sku?: string;
  mpn?: string;
}

export interface CreateProductInput {
  name: string;
  url: string;
  currentPrice: number;
  targetPrice?: number;
  image?: string;
  currency?: string;
  availability?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// API Functions
export const productApi = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const result: ApiResponse<Product[]> = await response.json();
    return result.data || [];
  },

  // Create product manually
  async createProduct(data: CreateProductInput): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    const result: ApiResponse<Product> = await response.json();
    if (!result.data) throw new Error('No product data returned');
    return result.data;
  },

  // Create product by URL (auto-fetch details)
  async createProductByUrl(urls: string[]): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product by URL');
    }
    const result: ApiResponse<Product[]> = await response.json();
    return result.data || [];
  },
};

export const schedulerApi = {
  // Start scheduler
  async start(cronExpression: string = '0 */6 * * *'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedule/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cronExpression }),
    });
    if (!response.ok) throw new Error('Failed to start scheduler');
  },

  // Stop scheduler
  async stop(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedule/stop`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to stop scheduler');
  },

  // Get scheduler status
  async getStatus(): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/schedule/status`);
    if (!response.ok) throw new Error('Failed to get scheduler status');
    const result: ApiResponse<{ isRunning: boolean }> = await response.json();
    return result.data?.isRunning || false;
  },

  // Trigger manual price check
  async checkNow(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedule/check-now`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger price check');
  },
};
