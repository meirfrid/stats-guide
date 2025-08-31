
export interface TTestResult {
  statistic: number;
  pValue: number;
  df: number;
  meanDiff: number;
  cohensD: number;
  confidence95: [number, number];
  significant: boolean;
}

export const independentTTest = (group1: number[], group2: number[]): TTestResult => {
  const validGroup1 = group1.filter(val => val !== null && val !== undefined && !isNaN(val));
  const validGroup2 = group2.filter(val => val !== null && val !== undefined && !isNaN(val));
  
  const n1 = validGroup1.length;
  const n2 = validGroup2.length;
  
  if (n1 < 2 || n2 < 2) {
    return {
      statistic: 0,
      pValue: 1,
      df: 0,
      meanDiff: 0,
      cohensD: 0,
      confidence95: [0, 0],
      significant: false
    };
  }

  const mean1 = validGroup1.reduce((sum, val) => sum + val, 0) / n1;
  const mean2 = validGroup2.reduce((sum, val) => sum + val, 0) / n2;
  const meanDiff = mean1 - mean2;
  
  const var1 = validGroup1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
  const var2 = validGroup2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
  
  // Welch's t-test (unequal variances)
  const se = Math.sqrt(var1 / n1 + var2 / n2);
  const t = meanDiff / se;
  
  // Welch-Satterthwaite equation for degrees of freedom
  const df = Math.pow(var1 / n1 + var2 / n2, 2) / 
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));
  
  // Pooled standard deviation for Cohen's d
  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
  const cohensD = meanDiff / pooledSD;
  
  // Approximate p-value (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(t) / Math.sqrt(1 + t * t / df)));
  
  // 95% confidence interval for mean difference
  const tCrit = 1.96; // approximation
  const margin = tCrit * se;
  const confidence95: [number, number] = [meanDiff - margin, meanDiff + margin];
  
  return {
    statistic: t,
    pValue: Math.max(0, Math.min(1, pValue)),
    df,
    meanDiff,
    cohensD,
    confidence95,
    significant: Math.abs(pValue) < 0.05
  };
};

// Helper function (same as in correlation.ts)
const normalCDF = (x: number): number => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

const erf = (x: number): number => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};
