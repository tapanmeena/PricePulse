'use client';

import { Product } from '@/lib/api';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceHistory = product.priceHistory || [];
  const lowestPrice = priceHistory.length > 0 
    ? Math.min(...priceHistory.map(p => p.price))
    : product.currentPrice;
  
  const highestPrice = priceHistory.length > 0
    ? Math.max(...priceHistory.map(p => p.price))
    : product.currentPrice;

  const isTargetMet = product.targetPrice && product.currentPrice <= product.targetPrice;
  const priceChange = priceHistory.length > 1
    ? product.currentPrice - priceHistory[0].price
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={120}
              height={120}
              className="rounded-md object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.png';
              }}
            />
          ) : (
            <div className="w-[120px] h-[120px] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Domain:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{product.domain}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                product.availability.toLowerCase().includes('stock') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {product.availability}
              </span>
            </div>

            {product.lastChecked && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Last Checked:</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {new Date(product.lastChecked).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Price Information */}
        <div className="shrink-0 text-right">
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {product.currency} {product.currentPrice.toFixed(2)}
            </div>
            {priceChange !== 0 && (
              <div className={`text-sm font-medium ${
                priceChange > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}
              </div>
            )}
          </div>

          {product.targetPrice && (
            <div className={`text-sm mb-2 ${
              isTargetMet 
                ? 'text-green-600 dark:text-green-400 font-semibold' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Target: {product.currency} {product.targetPrice.toFixed(2)}
              {isTargetMet && ' ✓'}
            </div>
          )}

          {priceHistory.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Low: {product.currency} {lowestPrice.toFixed(2)}</div>
              <div>High: {product.currency} {highestPrice.toFixed(2)}</div>
            </div>
          )}

          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Product →
          </a>
        </div>
      </div>

      {/* Price History Chart */}
      {priceHistory.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price History ({priceHistory.length} records)
          </div>
          <div className="flex items-end gap-1 h-16">
            {priceHistory.slice(-20).map((history, index) => {
              const heightPercent = ((history.price - lowestPrice) / (highestPrice - lowestPrice || 1)) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  title={`${product.currency} ${history.price.toFixed(2)} on ${new Date(history.date).toLocaleDateString()}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
