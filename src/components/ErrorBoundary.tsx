import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error('Route Error:', error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          {error?.statusText || error?.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
          >
            Go to Home
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Reload Page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {error?.stack || JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;