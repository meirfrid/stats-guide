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
  bins?: number;
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
  
  console.log('=== CHART GENERATOR START ===');
  console.log('Instructions:', instructions);
  console.log('Available columns:', chartData.columns);
  
  // Extract mentioned column names with high precision
  const findMentionedColumns = (text: string): string[] => {
    const mentioned: string[] = [];
    
    chartData.columns.forEach(col => {
      const colLower = col.toLowerCase();
      const textLower = text.toLowerCase();
      
      // Check for direct mentions, quoted mentions, etc.
      if (textLower.includes(colLower) || textLower.includes(col) ||
          textLower.includes(`"${col}"`) || textLower.includes(`'${col}'`) ||
          textLower.includes(`"${colLower}"`) || textLower.includes(`'${colLower}'`) ||
          textLower.includes(`${col} `) || textLower.includes(` ${col}`) ||
          textLower.includes(`עמודת ${colLower}`) || textLower.includes(`משתנה ${colLower}`)) {
        mentioned.push(col);
      }
    });
    
    return mentioned;
  };
  
  const mentionedColumns = findMentionedColumns(instructions);
  console.log('Mentioned columns in chart instructions:', mentionedColumns);
  
  // Identify numeric and categorical columns
  const numericColumns = chartData.columns.filter(col => {
    const values = chartData.data.map(row => row[col]).filter(val => val !== null && val !== undefined);
    return values.length > 0 && values.some(val => typeof val === 'number' || !isNaN(Number(val)));
  });
  
  const categoricalColumns = chartData.columns.filter(col => 
    !numericColumns.includes(col) && 
    chartData.data.some(row => row[col] !== null && row[col] !== undefined)
  );

  console.log('Numeric columns:', numericColumns);
  console.log('Categorical columns:', categoricalColumns);

  // Parse chart requirements from instructions with high precision
  const chartRequests = parseChartRequests(instructions, numericColumns, categoricalColumns, mentionedColumns);
  
  console.log('Parsed chart requests:', chartRequests);
  
  chartRequests.forEach((request, index) => {
    console.log(`Processing chart request ${index + 1}:`, request);
    
    const chartData_processed = processDataForChart(chartData.data, request);
    if (chartData_processed && chartData_processed.length > 0) {
      const chart = {
        id: `chart_${index + 1}`,
        config: request,
        data: chartData_processed,
        title: request.title,
        downloadName: `${request.type}_chart_${index + 1}`
      };
      
      charts.push(chart);
      console.log(`Created chart:`, { id: chart.id, type: request.type, dataPoints: chartData_processed.length });
    } else {
      console.log(`No data generated for chart request:`, request);
    }
  });

  // Add default charts only if no specific mentions and no requests generated
  if (charts.length === 0 && mentionedColumns.length === 0) {
    console.log('No specific requests found, generating default charts');
    const defaultCharts = generateDefaultCharts(chartData, numericColumns, categoricalColumns);
    charts.push(...defaultCharts);
  }

  console.log('=== CHART GENERATOR COMPLETE ===');
  console.log(`Generated ${charts.length} charts`);

  return charts;
};

const parseChartRequests = (
  instructions: string, 
  numericCols: string[], 
  categoricalCols: string[],
  mentionedCols: string[]
): ChartConfig[] => {
  const requests: ChartConfig[] = [];
  const lowerInstructions = instructions.toLowerCase();

  console.log('Parsing chart requests with mentioned columns:', mentionedCols);

  // Filter mentioned columns by type
  const mentionedNumeric = mentionedCols.filter(col => numericCols.includes(col));
  const mentionedCategorical = mentionedCols.filter(col => categoricalCols.includes(col));

  console.log('Mentioned numeric columns:', mentionedNumeric);
  console.log('Mentioned categorical columns:', mentionedCategorical);

  // Histogram requests - more comprehensive detection
  if (lowerInstructions.includes('היסטוגרמה') || 
      lowerInstructions.includes('histogram') ||
      lowerInstructions.includes('התפלגות') ||
      lowerInstructions.includes('תדירות')) {
    
    if (mentionedNumeric.length > 0) {
      mentionedNumeric.forEach(col => {
        requests.push({
          type: 'histogram',
          title: `היסטוגרמה - התפלגות ${col}`,
          xAxis: col,
          bins: 20
        });
        console.log(`Added histogram request for column: ${col}`);
      });
    } else if (numericCols.length > 0) {
      requests.push({
        type: 'histogram',
        title: `היסטוגרמה - התפלגות ${numericCols[0]}`,
        xAxis: numericCols[0],
        bins: 20
      });
    }
  }

  // Bar chart requests - comprehensive detection
  if (lowerInstructions.includes('עמודות') || 
      lowerInstructions.includes('bar') ||
      lowerInstructions.includes('גרף עמודות') ||
      lowerInstructions.includes('עמודה') ||
      lowerInstructions.includes('בר')) {
    
    if (mentionedCategorical.length > 0 && mentionedNumeric.length > 0) {
      // Create bar chart for each combination
      mentionedCategorical.forEach(catCol => {
        mentionedNumeric.forEach(numCol => {
          requests.push({
            type: 'bar',
            title: `גרף עמודות: ${numCol} לפי ${catCol}`,
            xAxis: catCol,
            yAxis: numCol,
            aggregation: 'mean'
          });
          console.log(`Added bar chart: ${numCol} by ${catCol}`);
        });
      });
    } else if (categoricalCols.length > 0 && numericCols.length > 0) {
      // Fallback to first available
      requests.push({
        type: 'bar',
        title: `גרף עמודות: ${numericCols[0]} לפי ${categoricalCols[0]}`,
        xAxis: categoricalCols[0],
        yAxis: numericCols[0],
        aggregation: 'mean'
      });
    }
  }

  // Scatter plot requests - comprehensive detection
  if (lowerInstructions.includes('פיזור') || 
      lowerInstructions.includes('scatter') ||
      lowerInstructions.includes('נקודות') ||
      lowerInstructions.includes('קורלציה') ||
      lowerInstructions.includes('מתאם')) {
    
    if (mentionedNumeric.length >= 2) {
      requests.push({
        type: 'scatter',
        title: `גרף פיזור: ${mentionedNumeric[0]} מול ${mentionedNumeric[1]}`,
        xAxis: mentionedNumeric[0],
        yAxis: mentionedNumeric[1]
      });
      console.log(`Added scatter plot: ${mentionedNumeric[0]} vs ${mentionedNumeric[1]}`);
    } else if (numericCols.length >= 2) {
      requests.push({
        type: 'scatter',
        title: `גרף פיזור: ${numericCols[0]} מול ${numericCols[1]}`,
        xAxis: numericCols[0],
        yAxis: numericCols[1]
      });
    }
  }

  // Line chart requests - comprehensive detection
  if (lowerInstructions.includes('קו') || 
      lowerInstructions.includes('line') ||
      lowerInstructions.includes('מגמה') ||
      lowerInstructions.includes('זמן') ||
      lowerInstructions.includes('טרנד')) {
    
    if (mentionedNumeric.length >= 2) {
      requests.push({
        type: 'line',
        title: `גרף קו: ${mentionedNumeric[1]} לאורך ${mentionedNumeric[0]}`,
        xAxis: mentionedNumeric[0],
        yAxis: mentionedNumeric[1]
      });
      console.log(`Added line chart: ${mentionedNumeric[1]} along ${mentionedNumeric[0]}`);
    } else if (numericCols.length >= 2) {
      requests.push({
        type: 'line',
        title: `גרף קו: ${numericCols[1]} לאורך ${numericCols[0]}`,
        xAxis: numericCols[0],
        yAxis: numericCols[1]
      });
    }
  }

  console.log(`Generated ${requests.length} chart requests from instructions`);
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
      .slice(0, 500);

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
  }).slice(0, 20);
};
