'use client';

import { useState } from 'react';
import { RouteInput, CalculatedRoute, CargoType, Priority } from '@/types';
import { ORIGIN_PORTS, DESTINATION_PORTS } from '@/lib/routes-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { RouteCard } from './RouteCard';
import { Calculator, Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState<RouteInput>({
    origin: 'ras-tanura',
    destination: 'rotterdam',
    cargoType: 'crude',
    tons: 100000,
    priority: 'cost',
  });

  const [results, setResults] = useState<CalculatedRoute[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
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
                  setFormData({
                    ...formData,
                    cargoType: e.target.value as CargoType,
                  })
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
                onChange={(e) =>
                  setFormData({ ...formData, tons: parseInt(e.target.value) })
                }
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
                  setFormData({
                    ...formData,
                    priority: e.target.value as Priority,
                  })
                }
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
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
                <RouteCard
                  key={route.route.id}
                  route={route}
                  rank={index + 1}
                />
              ))}
            </div>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
