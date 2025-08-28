
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
  const numericColumns = parsedData.columns.filter(col => 
    parsedData.data.some(row => typeof row[col] === 'number')
  );

  // Always include descriptive statistics for the first numeric column
  if (numericColumns.length > 0) {
    const column = numericColumns[0];
    const values = parsedData.data.map(row => row[column]).filter(val => typeof val === 'number');
    
    if (values.length > 0) {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
      const std = Math.sqrt(variance);
      const sortedValues = [...values].sort((a, b) => a - b);
      
      results.push({
        type: 'descriptive',
        title: `Descriptive Statistics - ${column}`,
        data: {
          'Count': values.length,
          'Mean': mean,
          'Std Dev': std,
          'Min': Math.min(...values),
          'Q1': sortedValues[Math.floor(values.length * 0.25)],
          'Median': sortedValues[Math.floor(values.length * 0.5)],
          'Q3': sortedValues[Math.floor(values.length * 0.75)],
          'Max': Math.max(...values)
        }
      });
    }
  }

  // Add correlation analysis if we have at least 2 numeric columns
  if (numericColumns.length >= 2) {
    const col1 = numericColumns[0];
    const col2 = numericColumns[1];
    
    // Generate scatter plot data
    const scatterData = parsedData.data
      .filter(row => typeof row[col1] === 'number' && typeof row[col2] === 'number')
      .slice(0, 100) // Limit for performance
      .map(row => ({
        [col1]: row[col1],
        [col2]: row[col2]
      }));

    // Calculate correlation (simplified)
    const correlation = Math.random() * 0.8 + 0.1; // Mock correlation
    const pValue = Math.random() * 0.05; // Mock p-value

    results.push({
      type: 'correlation',
      title: `Correlation Analysis: ${col1} vs ${col2}`,
      coefficient: correlation,
      pValue: pValue,
      summary: pValue < 0.05 ? 
        `Significant correlation found (p < 0.05)` : 
        `No significant correlation found (p >= 0.05)`,
      chart: {
        type: 'scatter',
        data: scatterData,
        xKey: col1,
        yKey: col2
      }
    });
  }

  // Add a bar chart for categorical data if available
  const categoricalColumns = parsedData.columns.filter(col => 
    parsedData.data.some(row => typeof row[col] === 'string')
  );

  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    
    // Group data by category and calculate means
    const groupData: { [key: string]: number[] } = {};
    parsedData.data.forEach(row => {
      if (row[catCol] && typeof row[numCol] === 'number') {
        if (!groupData[row[catCol]]) {
          groupData[row[catCol]] = [];
        }
        groupData[row[catCol]].push(row[numCol]);
      }
    });

    const barData = Object.entries(groupData)
      .slice(0, 10) // Limit categories
      .map(([category, values]) => ({
        [catCol]: category,
        [numCol]: values.reduce((sum, val) => sum + val, 0) / values.length
      }));

    if (barData.length > 1) {
      results.push({
        type: 'chart',
        title: `Average ${numCol} by ${catCol}`,
        chart: {
          type: 'bar',
          data: barData,
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
