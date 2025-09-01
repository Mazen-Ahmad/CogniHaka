import React, { useState } from 'react';

interface OptimizationExtrasProps {
  capacityUtilization: number;
}

const OptimizationExtras: React.FC<OptimizationExtrasProps> = ({ capacityUtilization }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeminiQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const result = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await result.json();
      setResponse(data.response || 'No response received');
    } catch (error) {
      setResponse('Error connecting to Gemini AI');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Gemini AI Query Section */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Ask Gemini AI</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your optimization results..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleGeminiQuery()}
          />
          <button
            onClick={handleGeminiQuery}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Asking...' : 'Ask Gemini'}
          </button>
        </div>
        
        {response && (
          <div className="mt-4 p-3 bg-white border rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Gemini AI Response:</p>
            <p className="mt-1 text-gray-800">{response}</p>
          </div>
        )}
      </div>

      {/* Capacity Alert Section */}
      {capacityUtilization > 100 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                <strong>Capacity Warning:</strong> Your factories do not have the production capacity to meet the demands, please ask T-Cog for possible solutions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationExtras;
