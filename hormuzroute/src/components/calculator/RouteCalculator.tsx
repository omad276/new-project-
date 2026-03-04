'use client';

import { useCallback } from 'react';
import { CalculatedRoute, CargoType, Priority } from '@/types';
import { ORIGIN_PORTS, DESTINATION_PORTS } from '@/lib/routes-data';
import { useCalculatorStore, useHistoryStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { RouteCard } from './RouteCard';
import { AIInsightPanel } from './AIInsightPanel';
import { Calculator, Loader2, Sparkles } from 'lucide-react';

const cargoTypeOptions = [
  { value: 'crude', label: 'Crude Oil' },
  { value: 'refined', label: 'Refined Products' },
  { value: 'lng', label: 'LNG' },
  { value: 'lpg', label: 'LPG' },
  { value: 'chemicals', label: 'Chemicals' },
];

const priorityOptions = [
  { value: 'cost', label: 'Lowest Cost' },
  { value: 'time', label: 'Fastest Transit' },
  { value: 'safety', label: 'Lowest Risk' },
];

export function RouteCalculator() {
  // Calculator store
  const {
    formData,
    setFormData,
    results,
    setResults,
    isCalculating,
    setIsCalculating,
    error,
    setError,
    aiContent,
    setAIContent,
    aiLoading,
    setAILoading,
    aiError,
    setAIError,
    aiEnabled,
    setAIEnabled,
  } = useCalculatorStore();

  // History store
  const { addEntry } = useHistoryStore();

  const fetchAIAnalysis = useCallback(
    async (routes: CalculatedRoute[]) => {
      setAILoading(true);
      setAIError(null);
      setAIContent('');

      try {
        const response = await fetch('/api/ai-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ routes, input: formData }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to get AI analysis');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let content = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          content += chunk;
          setAIContent(content);
        }
      } catch (err) {
        setAIError(err instanceof Error ? err.message : 'AI analysis failed');
      } finally {
        setAILoading(false);
      }
    },
    [formData, setAIContent, setAIError, setAILoading]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setError(null);
    setResults(null);
    setAIContent('');
    setAIError(null);

    try {
      const response = await fetch('/api/calculate-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate routes');
      }

      const data = await response.json();
      setResults(data.routes);

      // Add to history
      addEntry(formData, data.routes);

      // Trigger AI analysis if enabled
      if (aiEnabled && data.routes.length > 0) {
        fetchAIAnalysis(data.routes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRetryAI = () => {
    if (results) {
      fetchAIAnalysis(results);
    }
  };

  const originOptions = ORIGIN_PORTS.map((port) => ({
    value: port.id,
    label: `${port.name}, ${port.country}`,
  }));

  const destinationOptions = DESTINATION_PORTS.map((port) => ({
    value: port.id,
    label: `${port.name}, ${port.country}`,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-500" />
            Route Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-slate-300">
                Origin Port
              </Label>
              <Select
                id="origin"
                options={originOptions}
                value={formData.origin}
                onChange={(e) => setFormData({ origin: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-slate-300">
                Destination Port
              </Label>
              <Select
                id="destination"
                options={destinationOptions}
                value={formData.destination}
                onChange={(e) => setFormData({ destination: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargoType" className="text-slate-300">
                Cargo Type
              </Label>
              <Select
                id="cargoType"
                options={cargoTypeOptions}
                value={formData.cargoType}
                onChange={(e) =>
                  setFormData({ cargoType: e.target.value as CargoType })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tons" className="text-slate-300">
                Cargo Volume (tons)
              </Label>
              <Input
                id="tons"
                type="number"
                min={1000}
                max={500000}
                step={1000}
                value={formData.tons}
                onChange={(e) => setFormData({ tons: parseInt(e.target.value) })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300">
                Optimization Priority
              </Label>
              <Select
                id="priority"
                options={priorityOptions}
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ priority: e.target.value as Priority })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-md">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-slate-300">AI Analysis</span>
              </div>
              <button
                type="button"
                onClick={() => setAIEnabled(!aiEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  aiEnabled ? 'bg-orange-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    aiEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <Button
              type="submit"
              disabled={isCalculating}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                'Calculate Routes'
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {results ? (
          <>
            <h2 className="text-xl font-semibold text-white">
              Recommended Routes
            </h2>
            <div className="space-y-4">
              {results.map((route, index) => (
                <RouteCard key={route.route.id} route={route} rank={index + 1} />
              ))}
            </div>

            {/* AI Insight Panel */}
            {aiEnabled && (aiContent || aiLoading || aiError) && (
              <div className="mt-6">
                <AIInsightPanel
                  content={aiContent}
                  isLoading={aiLoading}
                  error={aiError}
                  onRetry={handleRetryAI}
                />
              </div>
            )}
          </>
        ) : (
          <Card className="bg-slate-800 border-slate-700 h-full flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center py-12">
              <Calculator className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400">
                Configure Your Route
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm">
                Fill in the parameters on the left and click Calculate to see
                optimized route recommendations.
              </p>
              {aiEnabled && (
                <p className="text-orange-500/70 text-sm mt-4 flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  AI Analysis enabled
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
