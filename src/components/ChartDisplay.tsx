
import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Download, Image, Smartphone, Monitor } from 'lucide-react';
import { downloadChart, downloadChartMobile, ChartDownloadOptions } from '@/utils/chartDownloader';
import { useToast } from '@/hooks/use-toast';
import { GeneratedChart } from '@/utils/chartGenerator';

interface ChartDisplayProps {
  chart: GeneratedChart;
  className?: string;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chart, className = '' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = async (format: 'png' | 'jpg' = 'png', mobile: boolean = false) => {
    if (!chartRef.current) return;

    try {
      if (mobile) {
        await downloadChartMobile(chartRef.current, chart.downloadName);
      } else {
        const options: ChartDownloadOptions = {
          format,
          quality: 0.92,
          backgroundColor: '#ffffff',
          width: 1280,
          height: 900
        };
        await downloadChart(chartRef.current, chart.downloadName, options);
      }

      toast({
        title: "גרף הורד בהצלחה",
        description: `הגרף ${chart.title} נשמר למכשיר שלך`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "שגיאה בהורדה",
        description: "לא הצלחנו להוריד את הגרף. נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const renderChart = () => {
    const chartConfig = {
      [chart.config.yAxis || 'count']: {
        label: chart.config.yAxis || 'כמות',
        color: "hsl(var(--primary))",
      },
    };

    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))', 
      'hsl(var(--accent))',
      'hsl(220, 70%, 50%)',
      'hsl(280, 70%, 50%)',
      'hsl(140, 70%, 50%)',
      'hsl(40, 70%, 50%)',
      'hsl(0, 70%, 50%)',
    ];

    const commonMargin = { top: 30, right: 30, left: 40, bottom: 110 };

    switch (chart.config.type) {
      case 'histogram':
        return (
          <div className="w-full h-[400px] sm:h-[500px] p-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart.data} margin={commonMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bin" 
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    fontSize={10}
                    interval={0}
                  />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))">
                    {chart.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      case 'bar':
        return (
          <div className="w-full h-[400px] sm:h-[500px] p-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart.data} margin={commonMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={chart.config.xAxis} 
                    angle={-45}
                    textAnchor="end"
                    height={90}
                    fontSize={10}
                    interval={0}
                  />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey={chart.config.yAxis} fill="hsl(var(--primary))">
                    {chart.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      case 'line':
        return (
          <div className="w-full h-[400px] sm:h-[500px] p-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data} margin={commonMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chart.config.xAxis} fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey={chart.config.yAxis} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      case 'scatter':
        return (
          <div className="w-full h-[400px] sm:h-[500px] p-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={chart.data} margin={commonMargin}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chart.config.xAxis} fontSize={12} />
                  <YAxis dataKey={chart.config.yAxis} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Scatter dataKey={chart.config.yAxis} fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );

      default:
        return <div className="p-8 text-center text-muted-foreground">סוג גרף לא נתמך</div>;
    }
  };

  return (
    <div className={`w-full border border-border/50 rounded-lg bg-card shadow-sm overflow-hidden ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border/50 gap-4">
        <h4 className="font-semibold text-base sm:text-lg text-foreground break-words flex-1">{chart.title}</h4>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleDownload('png', false)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex-1 sm:flex-none justify-center"
            title="הורד לנייח - רזולוציה גבוהה"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">רזולוציה גבוהה</span>
            <span className="sm:hidden">נייח</span>
          </button>
          <button
            onClick={() => handleDownload('png', true)}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium flex-1 sm:flex-none justify-center"
            title="הורד לנייד - מותאם למסך קטן"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">נייד</span>
            <span className="sm:hidden">מובייל</span>
          </button>
          <button
            onClick={() => handleDownload('jpg')}
            className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium flex-1 sm:flex-none justify-center"
            title="הורד כ-JPG - קובץ קטן יותר"
          >
            <Image className="w-4 h-4" />
            <span>JPG</span>
          </button>
        </div>
      </div>
      
      <div ref={chartRef} data-chart className="w-full bg-white">
        {renderChart()}
      </div>
      
      <div className="p-4 text-sm text-muted-foreground border-t border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>סוג: {chart.config.type} | נתונים: {chart.data.length} רשומות</span>
          <span className="text-xs">לחץ על כפתורי ההורדה לשמירת הגרף</span>
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;
