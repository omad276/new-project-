'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AIInsightPanelProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AIInsightPanel({
  content,
  isLoading,
  error,
  onRetry,
}: AIInsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            AI Analysis Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-4">{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-800/80 border-slate-700 border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI Route Advisor
            {isLoading && (
              <span className="text-sm font-normal text-slate-400 ml-2">
                Analyzing...
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading && !content ? (
            <div className="space-y-3">
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-2/3"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-5/6"></div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content.split('\n').map((line, i) => {
                  // Format headers
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={i} className="text-white font-semibold mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.match(/^\*\*.*\*\*:/)) {
                    const [header, ...rest] = line.split(':');
                    return (
                      <div key={i} className="mt-4 mb-2">
                        <span className="text-white font-semibold">
                          {header.replace(/\*\*/g, '')}:
                        </span>
                        <span className="text-slate-300">
                          {rest.join(':')}
                        </span>
                      </div>
                    );
                  }
                  // Format bullet points
                  if (line.match(/^[-•]\s/)) {
                    return (
                      <div key={i} className="flex gap-2 ml-4 my-1">
                        <span className="text-orange-500">•</span>
                        <span>{line.replace(/^[-•]\s/, '')}</span>
                      </div>
                    );
                  }
                  // Format numbered lists
                  if (line.match(/^\d+\.\s/)) {
                    return (
                      <div key={i} className="ml-4 my-1">
                        {line}
                      </div>
                    );
                  }
                  // Regular text
                  if (line.trim()) {
                    return (
                      <p key={i} className="my-1">
                        {line}
                      </p>
                    );
                  }
                  return <br key={i} />;
                })}
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1"></span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
