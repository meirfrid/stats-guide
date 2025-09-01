import { calculateDescriptiveStats } from './statistics/descriptiveStats';
import { calculatePearsonCorrelation } from './statistics/correlation';
import { independentTTest } from './statistics/ttest';
import { parseUserInstructions } from './statistics/instructionParser';
import { generateChartsFromInstructions, GeneratedChart } from './chartGenerator';

interface ParsedData {
  data: any[];
  columns: string[];
  fileName: string;
}

interface AnalysisResult {
  type: 'descriptive' | 'correlation' | 'ttest' | 'chart';
  title: string;
  data?: any;
  chart?: {
    type: 'bar' | 'line' | 'scatter' | 'histogram' | 'boxplot';
    data: any[];
    xKey: string;
    yKey: string;
    title?: string;
  };
  summary?: string;
  pValue?: number;
  coefficient?: number;
  confidence?: [number, number];
  variables?: string[];
  sampleSize?: number;
  rawData?: any[];
}

export const generateAnalysisResults = (
  parsedData: ParsedData, 
  instructions: string
): { results: AnalysisResult[]; charts: GeneratedChart[] } => {
  const results: AnalysisResult[] = [];
  
  console.log('=== ANALYSIS ENGINE START ===');
  console.log('User instructions:', instructions);
  console.log('Available data columns:', parsedData.columns);
  console.log('Data sample:', parsedData.data.slice(0, 3));
  
  // Parse user instructions with high precision
  const parsed = parseUserInstructions(instructions, parsedData.columns);
  
  console.log('Parsed user request:', parsed);
  
  // Identify numeric and categorical columns from available data
  const numericColumns = parsedData.columns.filter(col => {
    const values = parsedData.data.map(row => row[col]).filter(val => val !== null && val !== undefined);
    const isNumeric = values.length > 0 && values.some(val => typeof val === 'number' || !isNaN(Number(val)));
    if (isNumeric) {
      console.log(`Column "${col}" identified as numeric`);
    }
    return isNumeric;
  });
  
  const categoricalColumns = parsedData.columns.filter(col => {
    const hasData = parsedData.data.some(row => row[col] !== null && row[col] !== undefined);
    const isNotNumeric = !numericColumns.includes(col);
    if (hasData && isNotNumeric) {
      console.log(`Column "${col}" identified as categorical`);
    }
    return hasData && isNotNumeric;
  });

  // Generate dynamic charts based on user instructions
  const generatedCharts = generateChartsFromInstructions(
    { data: parsedData.data, columns: parsedData.columns },
    instructions
  );

  // DESCRIPTIVE STATISTICS - Use exactly specified columns
  if (parsed.analyses.includes('descriptive')) {
    console.log('=== PERFORMING DESCRIPTIVE ANALYSIS ===');
    
    let columnsToAnalyze: string[] = [];
    
    // Use specifically requested columns if available
    if (parsed.specificRequests.descriptiveFor && parsed.specificRequests.descriptiveFor.length > 0) {
      columnsToAnalyze = parsed.specificRequests.descriptiveFor.filter(col => 
        numericColumns.includes(col)
      );
      console.log('Using specifically requested columns for descriptive:', columnsToAnalyze);
    } 
    // Use target columns if mentioned
    else if (parsed.targetColumns.length > 0) {
      columnsToAnalyze = parsed.targetColumns.filter(col => 
        numericColumns.includes(col)
      );
      console.log('Using target columns for descriptive:', columnsToAnalyze);
    }
    // Fallback to first few numeric columns
    else {
      columnsToAnalyze = numericColumns.slice(0, 3);
      console.log('Using fallback columns for descriptive:', columnsToAnalyze);
    }

    columnsToAnalyze.forEach(column => {
      console.log(`Calculating descriptive stats for column: "${column}"`);
      
      const values = parsedData.data.map(row => {
        const val = row[column];
        return typeof val === 'number' ? val : Number(val);
      }).filter(val => !isNaN(val) && val !== null && val !== undefined);
      
      console.log(`Found ${values.length} valid values for column "${column}"`);
      console.log(`Sample values:`, values.slice(0, 10));
      
      if (values.length > 0) {
        const stats = calculateDescriptiveStats(values);
        
        const rawDataSample = parsedData.data.slice(0, 50).map(row => ({ [column]: row[column] }));
        
        results.push({
          type: 'descriptive',
          title: `סטטיסטיקה תיאורית - ${column}`,
          data: {
            'מספר תצפיות': stats.count,
            'ממוצע': Number(stats.mean.toFixed(6)),
            'סטיית תקן': Number(stats.std.toFixed(6)),
            'מינימום': Number(stats.min.toFixed(6)),
            'רבעון ראשון': Number(stats.q1.toFixed(6)),
            'חציון': Number(stats.median.toFixed(6)),
            'רבעון שלישי': Number(stats.q3.toFixed(6)),
            'מקסימום': Number(stats.max.toFixed(6)),
            'חסרים': stats.missing
          },
          variables: [column],
          sampleSize: stats.count,
          rawData: rawDataSample
        });
        
        console.log(`Completed descriptive stats for "${column}": mean=${stats.mean.toFixed(3)}, n=${stats.count}`);
      }
    });
  }

  // CORRELATION ANALYSIS - Use exactly specified pairs
  if (parsed.analyses.includes('correlation')) {
    console.log('=== PERFORMING CORRELATION ANALYSIS ===');
    
    let correlationPairs: Array<{ x: string; y: string }> = [];
    
    // Use specifically requested correlation pairs
    if (parsed.specificRequests.correlationPairs && parsed.specificRequests.correlationPairs.length > 0) {
      correlationPairs = parsed.specificRequests.correlationPairs.filter(pair => 
        numericColumns.includes(pair.x) && numericColumns.includes(pair.y)
      );
      console.log('Using specifically requested correlation pairs:', correlationPairs);
    }
    // Use target columns if mentioned
    else if (parsed.targetColumns.length >= 2) {
      const numericTargets = parsed.targetColumns.filter(col => numericColumns.includes(col));
      if (numericTargets.length >= 2) {
        correlationPairs = [{ x: numericTargets[0], y: numericTargets[1] }];
        console.log('Using target columns for correlation:', correlationPairs);
      }
    }
    // Fallback to first two numeric columns
    else if (numericColumns.length >= 2) {
      correlationPairs = [{ x: numericColumns[0], y: numericColumns[1] }];
      console.log('Using fallback columns for correlation:', correlationPairs);
    }
    
    correlationPairs.forEach(pair => {
      console.log(`Calculating correlation between "${pair.x}" and "${pair.y}"`);
      
      const xValues = parsedData.data.map(row => {
        const val = row[pair.x];
        return typeof val === 'number' ? val : Number(val);
      });
      
      const yValues = parsedData.data.map(row => {
        const val = row[pair.y];
        return typeof val === 'number' ? val : Number(val);
      });
      
      const corResult = calculatePearsonCorrelation(xValues, yValues);
      
      console.log(`Correlation result: r=${corResult.coefficient.toFixed(4)}, p=${corResult.pValue.toFixed(6)}, n=${corResult.n}`);
      
      // Generate scatter plot data with actual values
      const scatterData = parsedData.data
        .map(row => ({ 
          [pair.x]: Number(row[pair.x]), 
          [pair.y]: Number(row[pair.y]) 
        }))
        .filter(row => 
          !isNaN(row[pair.x]) && !isNaN(row[pair.y]) &&
          row[pair.x] !== null && row[pair.y] !== null
        )
        .slice(0, 500); // Limit for performance

      const rawDataSample = parsedData.data.slice(0, 50).map(row => ({ 
        [pair.x]: row[pair.x], 
        [pair.y]: row[pair.y] 
      }));

      results.push({
        type: 'correlation',
        title: `ניתוח מתאמים: ${pair.x} מול ${pair.y}`,
        coefficient: Number(corResult.coefficient.toFixed(6)),
        pValue: Number(corResult.pValue.toFixed(8)),
        summary: `${corResult.significant ? 'נמצא מתאם מובהק' : 'לא נמצא מתאם מובהק'} (n=${corResult.n}, r=${corResult.coefficient.toFixed(4)}, p=${corResult.pValue < 0.001 ? '<0.001' : corResult.pValue.toFixed(4)})`,
        chart: {
          type: 'scatter',
          data: scatterData,
          xKey: pair.x,
          yKey: pair.y,
          title: `${pair.x} מול ${pair.y}`
        },
        variables: [pair.x, pair.y],
        sampleSize: corResult.n,
        rawData: rawDataSample
      });
    });
  }

  // T-TEST ANALYSIS - Use exactly specified groups
  if (parsed.analyses.includes('ttest')) {
    console.log('=== PERFORMING T-TEST ANALYSIS ===');
    
    let testSpecs: Array<{ variable: string; groupBy: string }> = [];
    
    // Use specifically requested comparison
    if (parsed.specificRequests.compareGroups) {
      const spec = parsed.specificRequests.compareGroups;
      if (numericColumns.includes(spec.variable) && categoricalColumns.includes(spec.groupBy)) {
        testSpecs.push(spec);
        console.log('Using specifically requested t-test:', spec);
      }
    }
    // Use target columns if mentioned
    else if (parsed.targetColumns.length >= 2) {
      const numericTarget = parsed.targetColumns.find(col => numericColumns.includes(col));
      const categoricalTarget = parsed.targetColumns.find(col => categoricalColumns.includes(col));
      
      if (numericTarget && categoricalTarget) {
        testSpecs.push({ variable: numericTarget, groupBy: categoricalTarget });
        console.log('Using target columns for t-test:', { variable: numericTarget, groupBy: categoricalTarget });
      }
    }
    // Fallback
    else if (numericColumns.length > 0 && categoricalColumns.length > 0) {
      testSpecs.push({ variable: numericColumns[0], groupBy: categoricalColumns[0] });
      console.log('Using fallback columns for t-test:', { variable: numericColumns[0], groupBy: categoricalColumns[0] });
    }
    
    testSpecs.forEach(spec => {
      console.log(`Performing t-test: "${spec.variable}" by "${spec.groupBy}"`);
      
      // Get unique categories
      const categories = [...new Set(parsedData.data.map(row => row[spec.groupBy]).filter(Boolean))];
      console.log(`Found categories in "${spec.groupBy}":`, categories);
      
      if (categories.length >= 2) {
        const group1Data = parsedData.data
          .filter(row => row[spec.groupBy] === categories[0])
          .map(row => Number(row[spec.variable]))
          .filter(val => !isNaN(val));
          
        const group2Data = parsedData.data
          .filter(row => row[spec.groupBy] === categories[1])
          .map(row => Number(row[spec.variable]))
          .filter(val => !isNaN(val));
        
        console.log(`Group 1 (${categories[0]}): n=${group1Data.length}, mean=${group1Data.length > 0 ? (group1Data.reduce((a,b) => a+b, 0)/group1Data.length).toFixed(3) : 'N/A'}`);
        console.log(`Group 2 (${categories[1]}): n=${group2Data.length}, mean=${group2Data.length > 0 ? (group2Data.reduce((a,b) => a+b, 0)/group2Data.length).toFixed(3) : 'N/A'}`);
        
        if (group1Data.length >= 2 && group2Data.length >= 2) {
          const tResult = independentTTest(group1Data, group2Data);
          
          console.log(`T-test result: t=${tResult.statistic.toFixed(4)}, p=${tResult.pValue.toFixed(6)}, df=${tResult.df.toFixed(1)}`);
          
          const rawDataSample = parsedData.data.slice(0, 50).map(row => ({ 
            [spec.variable]: row[spec.variable], 
            [spec.groupBy]: row[spec.groupBy] 
          }));
          
          results.push({
            type: 'ttest',
            title: `מבחן t בלתי-תלוי: ${spec.variable} לפי ${spec.groupBy}`,
            coefficient: Number(tResult.statistic.toFixed(6)),
            pValue: Number(tResult.pValue.toFixed(8)),
            confidence: [
              Number(tResult.confidence95[0].toFixed(6)),
              Number(tResult.confidence95[1].toFixed(6))
            ],
            summary: `השוואה בין ${categories[0]} ל-${categories[1]}: ${tResult.significant ? 'נמצא הבדל מובהק' : 'לא נמצא הבדל מובהק'} (t=${tResult.statistic.toFixed(3)}, df=${tResult.df.toFixed(1)}, p=${tResult.pValue < 0.001 ? '<0.001' : tResult.pValue.toFixed(4)}, Cohen's d=${tResult.cohensD.toFixed(3)})`,
            variables: [spec.variable, spec.groupBy],
            sampleSize: group1Data.length + group2Data.length,
            rawData: rawDataSample
          });
        } else {
          console.log(`Insufficient data for t-test: Group 1 n=${group1Data.length}, Group 2 n=${group2Data.length}`);
        }
      } else {
        console.log(`Insufficient categories for t-test in "${spec.groupBy}": found ${categories.length} categories`);
      }
    });
  }

  // Convert generated charts to AnalysisResult format for backwards compatibility
  generatedCharts.forEach(chart => {
    results.push({
      type: 'chart',
      title: chart.title,
      chart: {
        type: chart.config.type as 'bar' | 'line' | 'scatter' | 'histogram' | 'boxplot',
        data: chart.data,
        xKey: chart.config.xAxis,
        yKey: chart.config.yAxis || 'count',
        title: chart.title
      }
    });
  });

  console.log('=== ANALYSIS ENGINE COMPLETE ===');
  console.log(`Generated ${results.length} analysis results and ${generatedCharts.length} charts`);
  console.log('Results summary:', results.map(r => ({ type: r.type, title: r.title, variables: r.variables })));

  return { results, charts: generatedCharts };
};

export const downloadResults = (results: AnalysisResult[], fileName: string) => {
  // Create CSV content with proper Hebrew encoding
  let csvContent = "\uFEFF"; // UTF-8 BOM for proper Hebrew display
  csvContent += "תוצאות הניתוח הסטטיסטי\n\n";
  
  results.forEach((result, index) => {
    csvContent += `${result.title}\n`;
    csvContent += "=====================================\n";
    
    if (result.data) {
      Object.entries(result.data).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`;
      });
    }
    
    if (result.coefficient !== undefined) {
      csvContent += `"מקדם","${result.coefficient}"\n`;
    }
    
    if (result.pValue !== undefined) {
      csvContent += `"P-Value","${result.pValue}"\n`;
    }
    
    if (result.confidence) {
      csvContent += `"רווח בטחון 95%","[${result.confidence[0]}, ${result.confidence[1]}]"\n`;
    }
    
    if (result.summary) {
      csvContent += `"סיכום","${result.summary}"\n`;
    }
    
    if (result.variables && result.variables.length > 0) {
      csvContent += `"משתנים","${result.variables.join(', ')}"\n`;
    }
    
    if (result.sampleSize) {
      csvContent += `"גודל המדגם","${result.sampleSize}"\n`;
    }
    
    csvContent += "\n";
  });

  // Add footer with analysis info
  csvContent += "=====================================\n";
  csvContent += "מידע על הניתוח\n";
  csvContent += "=====================================\n";
  csvContent += `"תאריך הניתוח","${new Date().toLocaleDateString('he-IL')}"\n`;
  csvContent += `"שעת הניתוח","${new Date().toLocaleTimeString('he-IL')}"\n`;
  csvContent += `"קובץ מקור","${fileName}"\n`;
  csvContent += `"מספר ניתוחים שבוצעו","${results.length}"\n`;

  // Create and download file with proper UTF-8 encoding
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, "")}_תוצאות_ניתוח.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

export const downloadCode = (results: AnalysisResult[], fileName: string, instructions: string) => {
  // Generate Python code
  const pythonCode = `#!/usr/bin/env python3
"""
Data Analysis Script
Generated automatically based on user instructions: ${instructions}
File: ${fileName}
Generated on: ${new Date().toISOString()}
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

# Load data
print("Loading data from ${fileName}...")
${fileName.endsWith('.csv') ? 
  `df = pd.read_csv('${fileName}')` : 
  `df = pd.read_excel('${fileName}')`}

print(f"Data shape: {df.shape}")
print("\\nFirst few rows:")
print(df.head())

# Data overview
print("\\n" + "="*50)
print("DATA OVERVIEW")
print("="*50)
print(df.info())
print("\\nDescriptive Statistics:")
print(df.describe())

# Analysis based on instructions: ${instructions}
${results.map(result => {
  switch (result.type) {
    case 'descriptive':
      return `
# Descriptive Statistics
print("\\n" + "="*50)
print("DESCRIPTIVE STATISTICS")
print("="*50)
numeric_cols = df.select_dtypes(include=[np.number]).columns
for col in numeric_cols:
    print(f"\\n{col}:")
    print(f"  Count: {df[col].count()}")
    print(f"  Mean: {df[col].mean():.3f}")
    print(f"  Std: {df[col].std():.3f}")
    print(f"  Min: {df[col].min():.3f}")
    print(f"  Max: {df[col].max():.3f}")`;
    
    case 'correlation':
      return `
# Correlation Analysis
print("\\n" + "="*50)
print("CORRELATION ANALYSIS")
print("="*50)
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) >= 2:
    corr_matrix = df[numeric_cols].corr()
    print("Correlation Matrix:")
    print(corr_matrix)
    
    # Create correlation heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Correlation Matrix')
    plt.tight_layout()
    plt.savefig('correlation_heatmap.png', dpi=300, bbox_inches='tight')
    plt.show()`;
    
    case 'chart':
      return `
# Data Visualization
print("\\n" + "="*50)
print("DATA VISUALIZATION")
print("="*50)
# Create visualizations based on data types
categorical_cols = df.select_dtypes(include=['object']).columns
numeric_cols = df.select_dtypes(include=[np.number]).columns

if len(categorical_cols) > 0 and len(numeric_cols) > 0:
    plt.figure(figsize=(12, 6))
    sns.barplot(data=df, x=categorical_cols[0], y=numeric_cols[0])
    plt.title(f'Average {numeric_cols[0]} by {categorical_cols[0]}')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('bar_chart.png', dpi=300, bbox_inches='tight')
    plt.show()`;
    
    default:
      return '';
  }
}).join('')}

# Save results
print("\\n" + "="*50)
print("SAVING RESULTS")
print("="*50)
results_summary = {
    'analysis_date': '${new Date().toISOString()}',
    'file_analyzed': '${fileName}',
    'instructions': '${instructions}',
    'data_shape': df.shape,
    'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
    'categorical_columns': df.select_dtypes(include=['object']).columns.tolist()
}

# Save to CSV
df.describe().to_csv('descriptive_stats.csv')
print("Results saved to descriptive_stats.csv")

print("\\nAnalysis completed successfully!")
print("Files generated:")
print("- descriptive_stats.csv")
print("- correlation_heatmap.png (if applicable)")
print("- bar_chart.png (if applicable)")
`;

  // Download Python code
  const blob = new Blob([pythonCode], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, "")}_analysis.py`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
