
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Code, Download, TrendingUp, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChartDisplay from './ChartDisplay';
import StatisticalDetails from './StatisticalDetails';
import { GeneratedChart } from '@/utils/chartGenerator';

interface AnalysisResult {
  type: 'descriptive' | 'correlation' | 'ttest' | 'chart';
  title: string;
  data?: any;
  chart?: {
    type: 'bar' | 'line' | 'scatter' | 'histogram' | 'boxplot';
    data: any[];
    xKey: string;
    yKey: string;
  };
  summary?: string;
  pValue?: number;
  coefficient?: number;
  confidence?: [number, number];
  variables?: string[];
  sampleSize?: number;
  rawData?: any[];
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
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={chart.xKey} 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={chart.yKey} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={chart.xKey} 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey={chart.yKey} stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      case 'scatter':
        return (
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={chart.xKey} 
                  fontSize={12}
                  tick={{ fontSize: 12 }}
                />
                <YAxis dataKey={chart.yKey} fontSize={12} />
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
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">סטטיסטיקה</th>
                    <th className="text-right p-2">ערך</th>
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
            <StatisticalDetails 
              type="descriptive" 
              data={result.data} 
              variables={result.variables || []}
              sampleSize={result.sampleSize || 0}
              rawData={result.rawData || []}
            />
          </div>
        );
      
      case 'correlation':
        const correlationVariables = result.variables || ['משתנה 1', 'משתנה 2'];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary-soft rounded-lg p-3">
                <span className="text-sm text-primary font-medium">מקדם מתאם פירסון</span>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {result.coefficient?.toFixed(4)}
                </div>
                <div className="text-xs text-primary mt-1">
                  {correlationVariables[0]} ↔ {correlationVariables[1]}
                </div>
              </div>
              <div className="bg-secondary-soft rounded-lg p-3">
                <span className="text-sm text-secondary font-medium">P-Value</span>
                <div className="text-xl sm:text-2xl font-bold text-secondary">
                  {result.pValue?.toFixed(6)}
                </div>
                <div className="text-xs text-secondary mt-1">
                  {(result.pValue || 0) < 0.05 ? 'מובהק סטטיסטית' : 'לא מובהק'}
                </div>
              </div>
            </div>
            
            <div className="bg-success-soft rounded-lg p-3">
              <div className="text-sm text-success font-medium">פרשנות המתאם</div>
              <div className="text-success text-sm mt-1">
                {Math.abs(result.coefficient || 0) < 0.1 ? 'אין מתאם' :
                 Math.abs(result.coefficient || 0) < 0.3 ? 'מתאם חלש' :
                 Math.abs(result.coefficient || 0) < 0.5 ? 'מתאם בינוני' :
                 Math.abs(result.coefficient || 0) < 0.7 ? 'מתאם חזק' : 'מתאם חזק מאוד'}
                {result.coefficient && result.coefficient > 0 ? ' חיובי' : ' שלילי'}
              </div>
            </div>

            {result.summary && (
              <p className="text-sm text-muted-foreground bg-surface-variant rounded p-3">{result.summary}</p>
            )}
            
            <StatisticalDetails 
              type="correlation" 
              data={result} 
              sampleSize={result.sampleSize || 0} 
              variables={correlationVariables}
              rawData={result.rawData || []}
            />
          </div>
        );
      
      case 'ttest':
        const ttestVariables = result.variables || ['קבוצה 1', 'קבוצה 2'];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary-soft rounded-lg p-3">
                <span className="text-sm text-primary font-medium">T-Statistic</span>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {result.coefficient?.toFixed(4)}
                </div>
                <div className="text-xs text-primary mt-1">
                  השוואה: {ttestVariables[0]} vs {ttestVariables[1]}
                </div>
              </div>
              <div className="bg-secondary-soft rounded-lg p-3">
                <span className="text-sm text-secondary font-medium">P-Value</span>
                <div className="text-xl sm:text-2xl font-bold text-secondary">
                  {result.pValue?.toFixed(6)}
                </div>
                <div className="text-xs text-secondary mt-1">
                  {(result.pValue || 0) < 0.05 ? 'הבדל מובהק' : 'אין הבדל מובהק'}
                </div>
              </div>
            </div>
            
            {result.confidence && (
              <div className="bg-success-soft rounded-lg p-3">
                <span className="text-sm text-success font-medium">רווח בטחון 95%</span>
                <div className="font-mono text-success text-sm mt-1">
                  [{result.confidence[0].toFixed(4)}, {result.confidence[1].toFixed(4)}]
                </div>
                <div className="text-xs text-success mt-1">
                  להפרש הממוצעים בין הקבוצות
                </div>
              </div>
            )}
            
            {result.summary && (
              <p className="text-sm text-muted-foreground bg-surface-variant rounded p-3">{result.summary}</p>
            )}
            
            <StatisticalDetails 
              type="ttest" 
              data={result}
              variables={ttestVariables}
              sampleSize={result.sampleSize || 0}
              rawData={result.rawData || []}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="analysis-card animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-semibold">{t('results')}</h3>
            <p className="text-sm text-muted-foreground break-all sm:break-normal">{fileName}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onDownloadResults}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-success text-success-foreground rounded-lg hover:bg-success-hover transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('downloadResults')}</span>
            <span className="sm:hidden">תוצאות</span>
          </button>
          <button
            onClick={onDownloadCode}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition-colors text-sm font-medium w-full sm:w-auto"
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">{t('downloadCode')}</span>
            <span className="sm:hidden">קוד</span>
          </button>
        </div>
      </div>

      {/* Analysis Instructions */}
      <div className="mb-6 p-4 bg-surface-variant rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          הוראות הניתוח שביצעתי
        </h4>
        <p className="text-sm text-muted-foreground break-words">{instructions}</p>
        <div className="mt-2 text-xs text-success bg-success-soft p-2 rounded">
          ✓ כל החישובים בוצעו על הנתונים האמיתיים מהקובץ שלך
        </div>
      </div>

      {/* Dynamic Charts */}
      {charts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            גרפים דינמיים - לחץ להורדה
          </h4>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
            <h4 className="font-semibold mb-4 text-base sm:text-lg">{result.title}</h4>
            
            {result.chart && (
              <div className="mb-4">
                {renderChart(result.chart)}
              </div>
            )}
            
            {renderResultContent(result)}
          </div>
        ))}
      </div>

      {/* Professional Footer */}
      <div className="mt-6 p-4 bg-primary-soft rounded-lg border border-primary/20">
        <h4 className="font-semibold text-primary mb-2 text-base sm:text-lg">אמינות המחקר</h4>
        <div className="text-sm text-primary space-y-1">
          <p>✓ כל הנוסחאות הסטטיסטיות הן לפי הסטנדרטים האקדמיים המקובלים</p>
          <p>✓ החישובים בוצעו על הנתונים הגולמיים מהקובץ שהעלית</p>
          <p>✓ ניתן להוריד את קוד Python לאימות החישובים</p>
          <p>✓ הפלט מתאים לשימוש במחקר אקדמי ופרסום מדעי</p>
          <p>✓ שמות העמודות והמשתנים מוצגים כפי שהם בקובץ המקורי</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
