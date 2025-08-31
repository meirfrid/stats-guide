
export interface CorrelationResult {
  coefficient: number;
  pValue: number;
  n: number;
  significant: boolean;
}

export const calculatePearsonCorrelation = (x: number[], y: number[]): CorrelationResult => {
  // Filter paired valid values
  const pairs = x.map((xVal, i) => ({ x: xVal, y: y[i] }))
    .filter(pair => 
      pair.x !== null && pair.x !== undefined && !isNaN(pair.x) &&
      pair.y !== null && pair.y !== undefined && !isNaN(pair.y)
    );
  
  const n = pairs.length;
  
  if (n < 2) {
    return { coefficient: 0, pValue: 1, n, significant: false };
  }

  const xVals = pairs.map(p => p.x);
  const yVals = pairs.map(p => p.y);
  
  const meanX = xVals.reduce((sum, val) => sum + val, 0) / n;
  const meanY = yVals.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let sumXX = 0;
  let sumYY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = yVals[i] - meanY;
    numerator += dx * dy;
    sumXX += dx * dx;
    sumYY += dy * dy;
  }
  
  const denominator = Math.sqrt(sumXX * sumYY);
  const r = denominator === 0 ? 0 : numerator / denominator;
  
  // Calculate p-value using t-distribution approximation
  const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));
  const df = n - 2;
  
  // Simplified p-value calculation (two-tailed)
  let pValue = 1;
  if (df > 0 && !isNaN(t) && isFinite(t)) {
    // Approximation for p-value
    pValue = 2 * (1 - normalCDF(t / Math.sqrt(1 + t * t / df)));
  }
  
  return {
    coefficient: r,
    pValue: Math.max(0, Math.min(1, pValue)),
    n,
    significant: pValue < 0.05
  };
};

// Approximation of normal CDF for p-value calculation
const normalCDF = (x: number): number => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

const erf = (x: number): number => {
  // Abramowitz and Stegun approximation
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
