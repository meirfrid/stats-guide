
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
          quality: 0.9,
          backgroundColor: '#ffffff'
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

    switch (chart.config.type) {
      case 'histogram':
        return (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="bin" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))">
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={chart.config.xAxis} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={chart.config.yAxis} fill="hsl(var(--primary))">
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.config.xAxis} />
                <YAxis />
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
        );

      case 'scatter':
        return (
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chart.config.xAxis} />
                <YAxis dataKey={chart.config.yAxis} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter dataKey={chart.config.yAxis} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default:
        return <div className="p-8 text-center text-muted-foreground">סוג גרף לא נתמך</div>;
    }
  };

  return (
    <div className={`border border-border/50 rounded-lg p-4 bg-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">{chart.title}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('png', false)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            title="הורד לנייח"
          >
            <Monitor className="w-4 h-4" />
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload('png', true)}
            className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors text-sm font-medium"
            title="הורד לנייד"
          >
            <Smartphone className="w-4 h-4" />
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload('jpg')}
            className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
            title="הורד כ-JPG"
          >
            <Image className="w-4 h-4" />
            JPG
          </button>
        </div>
      </div>
      
      <div ref={chartRef} className="w-full">
        {renderChart()}
      </div>
      
      <div className="mt-2 text-sm text-muted-foreground">
        סוג: {chart.config.type} | נתונים: {chart.data.length} רשומות
      </div>
    </div>
  );
};

export default ChartDisplay;
