import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Code, Download, TrendingUp, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChartDisplay from './ChartDisplay';
import { GeneratedChart } from '@/utils/chartGenerator';

interface AnalysisResult {
  type: 'descriptive' | 'correlation' | 'ttest' | 'chart';
  title: string;
  data?: any;
  chart?: {
    type: 'bar' | 'line' | 'scatter';
    data: any[];
    xKey: string;
    yKey: string;
  };
  summary?: string;
  pValue?: number;
  coefficient?: number;
  confidence?: [number, number];
}

interface AnalysisResultsProps {
  results: AnalysisResult[];
  charts?: GeneratedChart[];
  instructions: string;
  fileName: string;
  onDownloadResults: () => void;
  onDownloadCode: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  results, 
  charts = [],
  instructions, 
  fileName, 
  onDownloadResults, 
  onDownloadCode 
}) => {
  const { t } = useLanguage();

  const renderChart = (chart: AnalysisResult['chart']) => {
    if (!chart) return null;

    const chartConfig = {
      [chart.yKey]: {
        label: chart.yKey,
        color: "hsl(var(--primary))",
      },
    };

    switch (chart.type) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.xKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={chart.yKey} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.xKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey={chart.yKey} stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      case 'scatter':
        return (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.xKey} />
                <YAxis dataKey={chart.yKey} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter dataKey={chart.yKey} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      default:
        return null;
    }
  };

  const renderResultContent = (result: AnalysisResult) => {
    switch (result.type) {
      case 'descriptive':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Statistic</th>
                  <th className="text-right p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.data || {}).map(([key, value]) => (
                  <tr key={key} className="border-b">
                    <td className="p-2 font-medium">{key}</td>
                    <td className="p-2 text-right font-mono">
                      {typeof value === 'number' ? value.toFixed(3) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'correlation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Correlation Coefficient</span>
                <div className="text-2xl font-bold text-primary">
                  {result.coefficient?.toFixed(3)}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">P-Value</span>
                <div className="text-2xl font-bold text-secondary">
                  {result.pValue?.toFixed(6)}
                </div>
              </div>
            </div>
            {result.summary && (
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            )}
          </div>
        );
      
      case 'ttest':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">T-Statistic</span>
                <div className="text-2xl font-bold text-primary">
                  {result.coefficient?.toFixed(3)}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">P-Value</span>
                <div className="text-2xl font-bold text-secondary">
                  {result.pValue?.toFixed(6)}
                </div>
              </div>
            </div>
            {result.confidence && (
              <div>
                <span className="text-sm text-muted-foreground">95% Confidence Interval</span>
                <div className="font-mono">
                  [{result.confidence[0].toFixed(3)}, {result.confidence[1].toFixed(3)}]
                </div>
              </div>
            )}
            {result.summary && (
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="analysis-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-semibold">{t('results')}</h3>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDownloadResults}
            className="flex items-center gap-2 px-3 py-2 bg-success text-success-foreground rounded-lg hover:bg-success-hover transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {t('downloadResults')}
          </button>
          <button
            onClick={onDownloadCode}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition-colors text-sm font-medium"
          >
            <Code className="w-4 h-4" />
            {t('downloadCode')}
          </button>
        </div>
      </div>

      {/* Analysis Instructions */}
      <div className="mb-6 p-4 bg-surface-variant rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Analysis Instructions
        </h4>
        <p className="text-sm text-muted-foreground">{instructions}</p>
      </div>

      {/* Dynamic Charts */}
      {charts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            גרפים דינמיים
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart, index) => (
              <ChartDisplay key={chart.id || index} chart={chart} />
            ))}
          </div>
        </div>
      )}

      {/* Statistical Results */}
      <div className="space-y-6">
        {results.filter(result => result.type !== 'chart').map((result, index) => (
          <div key={index} className="border border-border/50 rounded-lg p-4">
            <h4 className="font-semibold mb-4">{result.title}</h4>
            
            {result.chart && (
              <div className="mb-4">
                {renderChart(result.chart)}
              </div>
            )}
            
            {renderResultContent(result)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults;
