import { calculateDescriptiveStats } from './statistics/descriptiveStats';
import { calculatePearsonCorrelation } from './statistics/correlation';
import { independentTTest } from './statistics/ttest';
import { parseUserInstructions } from './statistics/instructionParser';

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

export const generateAnalysisResults = (
  parsedData: ParsedData, 
  instructions: string
): AnalysisResult[] => {
  const results: AnalysisResult[] = [];
  
  // Parse user instructions
  const parsed = parseUserInstructions(instructions, parsedData.columns);
  
  // Identify numeric and categorical columns
  const numericColumns = parsedData.columns.filter(col => {
    const values = parsedData.data.map(row => row[col]).filter(val => val !== null && val !== undefined);
    return values.length > 0 && values.some(val => typeof val === 'number' || !isNaN(Number(val)));
  });
  
  const categoricalColumns = parsedData.columns.filter(col => 
    !numericColumns.includes(col) && 
    parsedData.data.some(row => row[col] !== null && row[col] !== undefined)
  );

  console.log('Analysis request:', { parsed, numericColumns, categoricalColumns });

  // Descriptive statistics
  if (parsed.analyses.includes('descriptive') && numericColumns.length > 0) {
    const targetCols = parsed.targetColumns.length > 0 ? 
      parsed.targetColumns.filter(col => numericColumns.includes(col)) : 
      numericColumns.slice(0, 3); // Limit for performance

    targetCols.forEach(column => {
      const values = parsedData.data.map(row => {
        const val = row[column];
        return typeof val === 'number' ? val : Number(val);
      }).filter(val => !isNaN(val));
      
      if (values.length > 0) {
        const stats = calculateDescriptiveStats(values);
        
        results.push({
          type: 'descriptive',
          title: `סטטיסטיקה תיאורית - ${column}`,
          data: {
            'מספר תצפיות': stats.count,
            'ממוצע': Number(stats.mean.toFixed(3)),
            'סטיית תקן': Number(stats.std.toFixed(3)),
            'מינימום': Number(stats.min.toFixed(3)),
            'רבעון ראשון': Number(stats.q1.toFixed(3)),
            'חציון': Number(stats.median.toFixed(3)),
            'רבעון שלישי': Number(stats.q3.toFixed(3)),
            'מקסימום': Number(stats.max.toFixed(3)),
            'חסרים': stats.missing
          }
        });
      }
    });
  }

  // Correlation analysis
  if (parsed.analyses.includes('correlation') && numericColumns.length >= 2) {
    const col1 = numericColumns[0];
    const col2 = numericColumns[1];
    
    const x = parsedData.data.map(row => {
      const val = row[col1];
      return typeof val === 'number' ? val : Number(val);
    });
    
    const y = parsedData.data.map(row => {
      const val = row[col2];
      return typeof val === 'number' ? val : Number(val);
    });
    
    const corResult = calculatePearsonCorrelation(x, y);
    
    // Generate scatter plot data
    const scatterData = parsedData.data
      .map(row => ({ [col1]: row[col1], [col2]: row[col2] }))
      .filter(row => 
        !isNaN(Number(row[col1])) && !isNaN(Number(row[col2])) &&
        row[col1] !== null && row[col2] !== null
      )
      .slice(0, 200); // Limit for performance

    results.push({
      type: 'correlation',
      title: `ניתוח מתאמים: ${col1} מול ${col2}`,
      coefficient: Number(corResult.coefficient.toFixed(3)),
      pValue: Number(corResult.pValue.toFixed(6)),
      summary: `${corResult.significant ? 'נמצא מתאם מובהק' : 'לא נמצא מתאם מובהק'} (n=${corResult.n}, p=${corResult.pValue < 0.001 ? '<0.001' : corResult.pValue.toFixed(3)})`,
      chart: {
        type: 'scatter',
        data: scatterData,
        xKey: col1,
        yKey: col2
      }
    });
  }

  // T-test analysis
  if (parsed.analyses.includes('ttest') && numericColumns.length > 0 && categoricalColumns.length > 0) {
    const numCol = numericColumns[0];
    const catCol = categoricalColumns[0];
    
    // Get unique categories
    const categories = [...new Set(parsedData.data.map(row => row[catCol]).filter(Boolean))];
    
    if (categories.length >= 2) {
      const group1Data = parsedData.data
        .filter(row => row[catCol] === categories[0])
        .map(row => Number(row[numCol]))
        .filter(val => !isNaN(val));
        
      const group2Data = parsedData.data
        .filter(row => row[catCol] === categories[1])
        .map(row => Number(row[numCol]))
        .filter(val => !isNaN(val));
      
      if (group1Data.length >= 2 && group2Data.length >= 2) {
        const tResult = independentTTest(group1Data, group2Data);
        
        results.push({
          type: 'ttest',
          title: `מבחן t בלתי-תלוי: ${numCol} לפי ${catCol}`,
          coefficient: Number(tResult.statistic.toFixed(3)),
          pValue: Number(tResult.pValue.toFixed(6)),
          confidence: [
            Number(tResult.confidence95[0].toFixed(3)),
            Number(tResult.confidence95[1].toFixed(3))
          ],
          summary: `${tResult.significant ? 'נמצא הבדל מובהק' : 'לא נמצא הבדל מובהק'} בין הקבוצות (t=${tResult.statistic.toFixed(3)}, df=${tResult.df.toFixed(1)}, p=${tResult.pValue < 0.001 ? '<0.001' : tResult.pValue.toFixed(3)}, Cohen's d=${tResult.cohensD.toFixed(3)})`
        });
      }
    }
  }

  // Add charts based on instructions
  if (numericColumns.length > 0 && categoricalColumns.length > 0) {
    const numCol = numericColumns[0];
    const catCol = categoricalColumns[0];
    
    // Group data by category and calculate means
    const categories = [...new Set(parsedData.data.map(row => row[catCol]).filter(Boolean))];
    const groupData = categories.slice(0, 10).map(category => {
      const categoryData = parsedData.data
        .filter(row => row[catCol] === category)
        .map(row => Number(row[numCol]))
        .filter(val => !isNaN(val));
      
      const mean = categoryData.length > 0 ? 
        categoryData.reduce((sum, val) => sum + val, 0) / categoryData.length : 0;
        
      return {
        [catCol]: category,
        [numCol]: Number(mean.toFixed(3))
      };
    }).filter(item => item[numCol] > 0);

    if (groupData.length > 1) {
      results.push({
        type: 'chart',
        title: `ממוצע ${numCol} לפי ${catCol}`,
        chart: {
          type: 'bar',
          data: groupData,
          xKey: catCol,
          yKey: numCol
        }
      });
    }
  }

  return results;
};

export const downloadResults = (results: AnalysisResult[], fileName: string) => {
  // Create CSV content
  let csvContent = "Analysis Results\n\n";
  
  results.forEach((result, index) => {
    csvContent += `${result.title}\n`;
    if (result.data) {
      Object.entries(result.data).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    }
    if (result.coefficient !== undefined) {
      csvContent += `Coefficient,${result.coefficient}\n`;
    }
    if (result.pValue !== undefined) {
      csvContent += `P-Value,${result.pValue}\n`;
    }
    if (result.summary) {
      csvContent += `Summary,"${result.summary}"\n`;
    }
    csvContent += "\n";
  });

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, "")}_results.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
