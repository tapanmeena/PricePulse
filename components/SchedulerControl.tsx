'use client';

import { useState, useEffect } from 'react';
import { schedulerApi } from '@/lib/api';

export default function SchedulerControl() {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cronExpression, setCronExpression] = useState('0 */6 * * *');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const status = await schedulerApi.getStatus();
      setIsRunning(status);
    } catch (err) {
      console.error('Failed to fetch scheduler status:', err);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await schedulerApi.start(cronExpression);
      setIsRunning(true);
      setSuccess('Scheduler started successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scheduler');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await schedulerApi.stop();
      setIsRunning(false);
      setSuccess('Scheduler stopped successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop scheduler');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await schedulerApi.checkNow();
      setSuccess('Manual price check triggered successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger price check');
    } finally {
      setLoading(false);
    }
  };

  const cronPresets = [
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Every 12 hours', value: '0 */12 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 30 minutes', value: '*/30 * * * *' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Price Checker Scheduler</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Schedule (Cron Expression)
          </label>
          <div className="flex gap-2">
            <select
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || isRunning}
            >
              {cronPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label} ({preset.value})
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Configure how often the system should check product prices
          </p>
        </div>

        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Starting...' : 'Start Scheduler'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Stopping...' : 'Stop Scheduler'}
            </button>
          )}

          <button
            onClick={handleCheckNow}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Checking...' : 'Check Prices Now'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">About the Scheduler</h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Automatically checks all tracked product prices</li>
            <li>• Updates price history for trend analysis</li>
            <li>• Can trigger manual checks anytime</li>
            <li>• Runs in the background when enabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
