import React from 'react';

interface APIStatusBannerProps {
  apiError: string | null;
  usingFallback: boolean;
  isLoading: boolean;
  onRetry: () => void;
}

const APIStatusBanner: React.FC<APIStatusBannerProps> = ({
  apiError,
  usingFallback,
  isLoading,
  onRetry
}) => {
  if (!apiError && !usingFallback) return null;

  return (
    <div className={`mb-6 p-4 rounded-lg border ${usingFallback ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className={`h-5 w-5 mr-2 ${usingFallback ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={usingFallback ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          <div>
            <h3 className={`text-sm font-medium ${usingFallback ? 'text-yellow-800' : 'text-red-800'}`}>
              {usingFallback ? '⚠️ API Connection Issue' : '❌ API Error'}
            </h3>
            <p className={`text-xs ${usingFallback ? 'text-yellow-700' : 'text-red-700'}`}>
              {apiError && `${apiError}. `}
              {usingFallback ? 'Showing demo data instead.' : 'Please check your connection and try again.'}
            </p>
          </div>
        </div>
        <button
          onClick={onRetry}
          disabled={isLoading}
          className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md ${
            usingFallback 
              ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' 
              : 'bg-red-200 text-red-800 hover:bg-red-300'
          } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    </div>
  );
};

export default APIStatusBanner;
