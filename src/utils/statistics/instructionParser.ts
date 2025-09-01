
export interface ParsedInstructions {
  analyses: string[];
  targetColumns: string[];
  groupColumns: string[];
  plotTypes: Array<{
    type: 'bar' | 'line' | 'scatter' | 'histogram' | 'boxplot';
    x?: string;
    y?: string;
    group?: string;
  }>;
  language: 'python' | 'r';
  specificRequests: {
    compareGroups?: { variable: string; groupBy: string };
    correlationPairs?: Array<{ x: string; y: string }>;
    descriptiveFor?: string[];
    chartSpecs?: Array<{
      type: string;
      variables: string[];
      title?: string;
    }>;
  };
}

export const parseUserInstructions = (
  instructions: string, 
  availableColumns: string[]
): ParsedInstructions => {
  const lowerInstructions = instructions.toLowerCase();
  const analyses: string[] = [];
  const targetColumns: string[] = [];
  const groupColumns: string[] = [];
  const plotTypes: any[] = [];
  const specificRequests: any = {};
  
  console.log('Parsing user instructions:', instructions);
  console.log('Available columns:', availableColumns);
  
  // Extract exact column names mentioned in Hebrew or English
  const findMentionedColumns = (text: string): string[] => {
    const mentioned: string[] = [];
    
    // Check each available column if it's mentioned in the text
    availableColumns.forEach(col => {
      // Check for exact matches (case insensitive)
      const colLower = col.toLowerCase();
      const textLower = text.toLowerCase();
      
      // Direct mention
      if (textLower.includes(colLower) || textLower.includes(col)) {
        mentioned.push(col);
      }
      
      // Check for quoted mentions
      const quotedPatterns = [
        `"${col}"`, `'${col}'`, `"${colLower}"`, `'${colLower}'`,
        `${col}`, colLower
      ];
      
      quotedPatterns.forEach(pattern => {
        if (textLower.includes(pattern)) {
          if (!mentioned.includes(col)) {
            mentioned.push(col);
          }
        }
      });
    });
    
    return mentioned;
  };
  
  const mentionedColumns = findMentionedColumns(instructions);
  console.log('Mentioned columns found:', mentionedColumns);
  
  // Parse specific analysis requests
  if (lowerInstructions.includes('סטטיסטיק') || lowerInstructions.includes('תיאור') || 
      lowerInstructions.includes('descriptive') || lowerInstructions.includes('mean') ||
      lowerInstructions.includes('ממוצע') || lowerInstructions.includes('חציון') ||
      lowerInstructions.includes('describe') || lowerInstructions.includes('summary')) {
    analyses.push('descriptive');
    
    // If specific columns mentioned for descriptive stats
    if (mentionedColumns.length > 0) {
      specificRequests.descriptiveFor = mentionedColumns;
    }
  }
  
  // Correlation analysis with specific pairs
  if (lowerInstructions.includes('מתאם') || lowerInstructions.includes('correlation') ||
      lowerInstructions.includes('קורלצי') || lowerInstructions.includes('corr')) {
    analyses.push('correlation');
    
    // Try to identify correlation pairs
    if (mentionedColumns.length >= 2) {
      // Look for patterns like "X vs Y", "X מול Y", "X and Y"
      const correlationPairs: Array<{ x: string; y: string }> = [];
      
      // Simple pairing - take consecutive mentioned columns
      for (let i = 0; i < mentionedColumns.length - 1; i++) {
        correlationPairs.push({
          x: mentionedColumns[i],
          y: mentionedColumns[i + 1]
        });
      }
      
      if (correlationPairs.length > 0) {
        specificRequests.correlationPairs = correlationPairs;
      }
    }
  }
  
  // T-test / group comparison
  if (lowerInstructions.includes('t-test') || lowerInstructions.includes('השווה') ||
      lowerInstructions.includes('קבוצות') || lowerInstructions.includes('compare') ||
      lowerInstructions.includes('group') || lowerInstructions.includes('בין') ||
      lowerInstructions.includes('difference')) {
    analyses.push('ttest');
    
    // Try to identify what to compare by what
    if (mentionedColumns.length >= 2) {
      // Assume first is the variable to analyze, second is grouping variable
      specificRequests.compareGroups = {
        variable: mentionedColumns[0],
        groupBy: mentionedColumns[1]
      };
    }
  }
  
  if (lowerInstructions.includes('anova') || lowerInstructions.includes('אנובה')) {
    analyses.push('anova');
  }
  
  // Chart specifications with mentioned variables
  const chartSpecs: Array<{ type: string; variables: string[]; title?: string }> = [];
  
  if (lowerInstructions.includes('boxplot') || lowerInstructions.includes('תיבה')) {
    plotTypes.push({ type: 'boxplot' });
    if (mentionedColumns.length >= 1) {
      chartSpecs.push({
        type: 'boxplot',
        variables: mentionedColumns,
        title: `Boxplot של ${mentionedColumns.join(', ')}`
      });
    }
  }
  
  if (lowerInstructions.includes('histogram') || lowerInstructions.includes('היסטוגרמה')) {
    plotTypes.push({ type: 'histogram' });
    if (mentionedColumns.length >= 1) {
      mentionedColumns.forEach(col => {
        chartSpecs.push({
          type: 'histogram',
          variables: [col],
          title: `התפלגות ${col}`
        });
      });
    }
  }
  
  if (lowerInstructions.includes('scatter') || lowerInstructions.includes('פיזור')) {
    plotTypes.push({ type: 'scatter' });
    if (mentionedColumns.length >= 2) {
      chartSpecs.push({
        type: 'scatter',
        variables: [mentionedColumns[0], mentionedColumns[1]],
        title: `${mentionedColumns[0]} מול ${mentionedColumns[1]}`
      });
    }
  }
  
  if (lowerInstructions.includes('bar') || lowerInstructions.includes('עמודות')) {
    plotTypes.push({ type: 'bar' });
    if (mentionedColumns.length >= 2) {
      chartSpecs.push({
        type: 'bar',
        variables: mentionedColumns,
        title: `${mentionedColumns[0]} לפי ${mentionedColumns[1]}`
      });
    }
  }
  
  // Set target columns to mentioned columns if any
  if (mentionedColumns.length > 0) {
    targetColumns.push(...mentionedColumns);
  }
  
  // Store chart specifications
  if (chartSpecs.length > 0) {
    specificRequests.chartSpecs = chartSpecs;
  }
  
  // Default behavior only if no specific columns mentioned
  if (analyses.length === 0 && mentionedColumns.length === 0) {
    analyses.push('descriptive', 'correlation');
  }
  
  if (plotTypes.length === 0 && mentionedColumns.length === 0) {
    plotTypes.push({ type: 'histogram' }, { type: 'boxplot' });
  }
  
  const language = lowerInstructions.includes('python') ? 'python' : 
                   lowerInstructions.includes('r ') ? 'r' : 'python';
  
  console.log('Parsed instructions result:', {
    analyses,
    targetColumns,
    groupColumns,
    plotTypes,
    specificRequests,
    language
  });
  
  return {
    analyses,
    targetColumns,
    groupColumns,
    plotTypes,
    language,
    specificRequests
  };
};
