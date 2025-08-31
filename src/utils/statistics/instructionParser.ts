
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
  
  // Detect analysis types
  if (lowerInstructions.includes('סטטיסטיק') || lowerInstructions.includes('תיאור') || 
      lowerInstructions.includes('descriptive') || lowerInstructions.includes('mean') ||
      lowerInstructions.includes('ממוצע') || lowerInstructions.includes('חציון')) {
    analyses.push('descriptive');
  }
  
  if (lowerInstructions.includes('מתאם') || lowerInstructions.includes('correlation') ||
      lowerInstructions.includes('קורלצי')) {
    analyses.push('correlation');
  }
  
  if (lowerInstructions.includes('t-test') || lowerInstructions.includes('השווה') ||
      lowerInstructions.includes('קבוצות') || lowerInstructions.includes('compare')) {
    analyses.push('ttest');
  }
  
  if (lowerInstructions.includes('anova') || lowerInstructions.includes('אנובה')) {
    analyses.push('anova');
  }
  
  // Detect plot types
  if (lowerInstructions.includes('boxplot') || lowerInstructions.includes('תיבה')) {
    plotTypes.push({ type: 'boxplot' });
  }
  
  if (lowerInstructions.includes('histogram') || lowerInstructions.includes('היסטוגרמה')) {
    plotTypes.push({ type: 'histogram' });
  }
  
  if (lowerInstructions.includes('scatter') || lowerInstructions.includes('פיזור')) {
    plotTypes.push({ type: 'scatter' });
  }
  
  if (lowerInstructions.includes('bar') || lowerInstructions.includes('עמודות')) {
    plotTypes.push({ type: 'bar' });
  }
  
  // Find mentioned columns
  const foundColumns = availableColumns.filter(col => 
    instructions.includes(col) || 
    lowerInstructions.includes(col.toLowerCase())
  );
  
  targetColumns.push(...foundColumns);
  
  // Default analyses if none specified
  if (analyses.length === 0) {
    analyses.push('descriptive', 'correlation');
  }
  
  // Default plots if none specified
  if (plotTypes.length === 0) {
    plotTypes.push({ type: 'histogram' }, { type: 'boxplot' });
  }
  
  const language = lowerInstructions.includes('python') ? 'python' : 
                   lowerInstructions.includes('r ') ? 'r' : 'python';
  
  return {
    analyses,
    targetColumns,
    groupColumns,
    plotTypes,
    language
  };
};
