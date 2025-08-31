
export interface DescriptiveResult {
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  missing: number;
}

export const calculateDescriptiveStats = (values: number[]): DescriptiveResult => {
  const validValues = values.filter(val => val !== null && val !== undefined && !isNaN(val));
  const missing = values.length - validValues.length;
  
  if (validValues.length === 0) {
    return {
      count: 0,
      mean: 0,
      std: 0,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      missing
    };
  }

  const sorted = [...validValues].sort((a, b) => a - b);
  const n = sorted.length;
  
  const mean = validValues.reduce((sum, val) => sum + val, 0) / n;
  const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);
  
  const getQuantile = (p: number) => {
    const index = p * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= n) return sorted[n - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    count: n,
    mean,
    std,
    min: sorted[0],
    q1: getQuantile(0.25),
    median: getQuantile(0.5),
    q3: getQuantile(0.75),
    max: sorted[n - 1],
    missing
  };
};
