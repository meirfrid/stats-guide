
interface ChartData {
  data: any[];
  columns: string[];
}

interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'histogram' | 'boxplot' | 'heatmap';
  title: string;
  xAxis: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'mean' | 'sum' | 'count';
  bins?: number; // for histogram
}

export interface GeneratedChart {
  id: string;
  config: ChartConfig;
  data: any[];
  title: string;
  downloadName: string;
}

export const generateChartsFromInstructions = (
  chartData: ChartData,
  instructions: string
): GeneratedChart[] => {
  const charts: GeneratedChart[] = [];
  const lowerInstructions = instructions.toLowerCase();
  
  // Identify numeric and categorical columns
  const numericColumns = chartData.columns.filter(col => {
    const values = chartData.data.map(row => row[col]).filter(val => val !== null && val !== undefined);
    return values.length > 0 && values.some(val => typeof val === 'number' || !isNaN(Number(val)));
  });
  
  const categoricalColumns = chartData.columns.filter(col => 
    !numericColumns.includes(col) && 
    chartData.data.some(row => row[col] !== null && row[col] !== undefined)
  );

  // Parse chart requirements from instructions
  const chartRequests = parseChartRequests(instructions, numericColumns, categoricalColumns);
  
  chartRequests.forEach((request, index) => {
    const chartData_processed = processDataForChart(chartData.data, request);
    if (chartData_processed && chartData_processed.length > 0) {
      charts.push({
        id: `chart_${index + 1}`,
        config: request,
        data: chartData_processed,
        title: request.title,
        downloadName: `${request.type}_chart_${index + 1}`
      });
    }
  });

  // Add default charts if none specified
  if (charts.length === 0) {
    charts.push(...generateDefaultCharts(chartData, numericColumns, categoricalColumns));
  }

  return charts;
};

const parseChartRequests = (
  instructions: string, 
  numericCols: string[], 
  categoricalCols: string[]
): ChartConfig[] => {
  const requests: ChartConfig[] = [];
  const lowerInstructions = instructions.toLowerCase();

  // Look for specific chart types mentioned
  if (lowerInstructions.includes('היסטוגרמה') || lowerInstructions.includes('histogram')) {
    numericCols.slice(0, 2).forEach(col => {
      requests.push({
        type: 'histogram',
        title: `התפלגות ${col}`,
        xAxis: col,
        bins: 20
      });
    });
  }

  if (lowerInstructions.includes('פיזור') || lowerInstructions.includes('scatter')) {
    if (numericCols.length >= 2) {
      requests.push({
        type: 'scatter',
        title: `גרף פיזור: ${numericCols[0]} מול ${numericCols[1]}`,
        xAxis: numericCols[0],
        yAxis: numericCols[1]
      });
    }
  }

  if (lowerInstructions.includes('עמודות') || lowerInstructions.includes('bar')) {
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      requests.push({
        type: 'bar',
        title: `ממוצע ${numericCols[0]} לפי ${categoricalCols[0]}`,
        xAxis: categoricalCols[0],
        yAxis: numericCols[0],
        aggregation: 'mean'
      });
    }
  }

  if (lowerInstructions.includes('קו') || lowerInstructions.includes('line')) {
    if (numericCols.length >= 2) {
      requests.push({
        type: 'line',
        title: `מגמה: ${numericCols[1]} לאורך ${numericCols[0]}`,
        xAxis: numericCols[0],
        yAxis: numericCols[1]
      });
    }
  }

  if (lowerInstructions.includes('boxplot') || lowerInstructions.includes('תיבה')) {
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      requests.push({
        type: 'boxplot',
        title: `Boxplot: ${numericCols[0]} לפי ${categoricalCols[0]}`,
        xAxis: categoricalCols[0],
        yAxis: numericCols[0]
      });
    }
  }

  return requests;
};

const generateDefaultCharts = (
  chartData: ChartData,
  numericCols: string[],
  categoricalCols: string[]
): GeneratedChart[] => {
  const defaultCharts: GeneratedChart[] = [];

  // Default histogram for first numeric column
  if (numericCols.length > 0) {
    const col = numericCols[0];
    const histogramData = generateHistogramData(chartData.data, col, 15);
    defaultCharts.push({
      id: 'default_histogram',
      config: {
        type: 'histogram',
        title: `התפלגות ${col}`,
        xAxis: 'bin',
        yAxis: 'count'
      },
      data: histogramData,
      title: `התפלגות ${col}`,
      downloadName: `histogram_${col}`
    });
  }

  // Default bar chart if we have categorical + numeric
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const catCol = categoricalCols[0];
    const numCol = numericCols[0];
    const aggregatedData = aggregateDataByCategory(chartData.data, catCol, numCol, 'mean');
    
    defaultCharts.push({
      id: 'default_bar',
      config: {
        type: 'bar',
        title: `ממוצע ${numCol} לפי ${catCol}`,
        xAxis: catCol,
        yAxis: numCol
      },
      data: aggregatedData,
      title: `ממוצע ${numCol} לפי ${catCol}`,
      downloadName: `bar_${numCol}_by_${catCol}`
    });
  }

  // Default scatter if we have 2+ numeric columns
  if (numericCols.length >= 2) {
    const scatterData = chartData.data
      .map(row => ({ 
        [numericCols[0]]: Number(row[numericCols[0]]), 
        [numericCols[1]]: Number(row[numericCols[1]]) 
      }))
      .filter(row => 
        !isNaN(row[numericCols[0]]) && !isNaN(row[numericCols[1]])
      )
      .slice(0, 500); // Limit for performance

    defaultCharts.push({
      id: 'default_scatter',
      config: {
        type: 'scatter',
        title: `${numericCols[0]} מול ${numericCols[1]}`,
        xAxis: numericCols[0],
        yAxis: numericCols[1]
      },
      data: scatterData,
      title: `${numericCols[0]} מול ${numericCols[1]}`,
      downloadName: `scatter_${numericCols[0]}_vs_${numericCols[1]}`
    });
  }

  return defaultCharts;
};

const processDataForChart = (data: any[], config: ChartConfig): any[] => {
  switch (config.type) {
    case 'histogram':
      return generateHistogramData(data, config.xAxis, config.bins || 15);
    
    case 'bar':
      return aggregateDataByCategory(data, config.xAxis, config.yAxis!, config.aggregation || 'mean');
    
    case 'scatter':
    case 'line':
      return data
        .map(row => ({ 
          [config.xAxis]: Number(row[config.xAxis]), 
          [config.yAxis!]: Number(row[config.yAxis!]) 
        }))
        .filter(row => 
          !isNaN(row[config.xAxis]) && !isNaN(row[config.yAxis!])
        )
        .slice(0, 1000);
    
    default:
      return data;
  }
};

const generateHistogramData = (data: any[], column: string, bins: number = 15): any[] => {
  const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
  
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;
  
  const histogram: { bin: string; count: number; range: string }[] = [];
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    const count = values.filter(val => val >= binStart && val < binEnd).length;
    
    histogram.push({
      bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      count,
      range: `${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`
    });
  }
  
  return histogram;
};

const aggregateDataByCategory = (
  data: any[], 
  categoryCol: string, 
  valueCol: string, 
  aggregation: 'mean' | 'sum' | 'count'
): any[] => {
  const groups: { [key: string]: number[] } = {};
  
  data.forEach(row => {
    const category = String(row[categoryCol]);
    const value = Number(row[valueCol]);
    
    if (!isNaN(value) && category) {
      if (!groups[category]) groups[category] = [];
      groups[category].push(value);
    }
  });
  
  return Object.entries(groups).map(([category, values]) => {
    let aggregatedValue: number;
    
    switch (aggregation) {
      case 'mean':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
        break;
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      default:
        aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    return {
      [categoryCol]: category,
      [valueCol]: Number(aggregatedValue.toFixed(3)),
      count: values.length
    };
  }).slice(0, 20); // Limit categories for readability
};
