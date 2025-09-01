
import React from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DetailedCalculationsProps {
  type: 'descriptive' | 'correlation' | 'ttest';
  data: any;
  rawData?: any[];
  variables?: string[];
  sampleSize?: number;
}

const DetailedCalculations: React.FC<DetailedCalculationsProps> = ({ 
  type, 
  data, 
  rawData = [], 
  variables = [],
  sampleSize = 0 
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderDescriptiveCalculations = () => {
    const values = rawData.slice(0, 10); // Show first 10 values as example
    const n = data['מספר תצפיות'] || sampleSize || rawData.length || 0;
    const mean = data['ממוצע'] || 0;
    const std = data['סטיית תקן'] || 0;
    const variableName = variables[0] || 'המשתנה';
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <h6 className="font-semibold mb-2">ערכי הנתונים (דוגמה מתוך {n}):</h6>
          <div className="font-mono text-xs bg-white p-2 rounded border overflow-x-auto">
            {values.map((val, idx) => (
              <span key={idx} className="mr-2">
                x₍{idx+1}₎ = {typeof val === 'number' ? val.toFixed(2) : val}
                {idx < values.length - 1 ? ',' : ''}
              </span>
            ))}
            {values.length < n && <span>... ועוד {n - values.length} ערכים</span>}
          </div>
        </div>

        <div className="bg-primary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב הממוצע:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              x̄ = (x₁ + x₂ + ... + x₍{n}₎) / {n}
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              x̄ = ({values.slice(0, 3).map((v, i) => typeof v === 'number' ? v.toFixed(2) : v).join(' + ')} + ... + עוד {n-3} ערכים) / {n}
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              x̄ = {mean.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="bg-secondary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-secondary">חישוב סטיית התקן:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              s = √[Σ(xᵢ - x̄)² / (n-1)]
            </div>
            <div className="text-xs text-secondary">
              <span className="font-semibold">שלב 1:</span> חישוב סכום הריבועים של הסטיות מהממוצע
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              Σ(xᵢ - {mean.toFixed(2)})²
            </div>
            <div className="text-xs text-secondary">
              <span className="font-semibold">שלב 2:</span> חלוקה ב-(n-1) = {n-1} (תיקון בסל)
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-secondary">
              s = {std.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">סיכום החישובים:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• חושב על {n} ערכים מהעמודה "{variableName}"</p>
            <p>• ממוצע: {mean.toFixed(6)}</p>
            <p>• סטיית תקן (עם תיקון בסל): {std.toFixed(6)}</p>
            <p>• חציון: {data['חציון']?.toFixed(6)}</p>
            <p>• טווח: {data['מינימום']?.toFixed(2)} עד {data['מקסימום']?.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCorrelationCalculations = () => {
    const r = data.coefficient || 0;
    const n = sampleSize || rawData.length || 100;
    const pValue = data.pValue || 0;
    const var1 = variables[0] || 'משתנה ראשון';
    const var2 = variables[1] || 'משתנה שני';
    const tStat = r * Math.sqrt((n-2)/(1-r*r));
    
    // Show sample data pairs
    const samplePairs = rawData.slice(0, 5);
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <h6 className="font-semibold mb-2">זוגות נתונים לדוגמה (מתוך {n}):</h6>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-1">i</th>
                  <th className="text-left p-1">{var1} (xᵢ)</th>
                  <th className="text-left p-1">{var2} (yᵢ)</th>
                </tr>
              </thead>
              <tbody>
                {samplePairs.map((pair, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-1">{idx + 1}</td>
                    <td className="p-1">{typeof pair[var1] === 'number' ? pair[var1].toFixed(3) : pair[var1]}</td>
                    <td className="p-1">{typeof pair[var2] === 'number' ? pair[var2].toFixed(3) : pair[var2]}</td>
                  </tr>
                ))}
                <tr>
                  <td className="p-1 font-bold">...</td>
                  <td className="p-1">ועוד {n-5} זוגות</td>
                  <td className="p-1"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-primary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב מקדם המתאם:</h6>
          <div className="space-y-2">
            <div className="text-xs text-primary mb-2">
              <span className="font-semibold">שלב 1:</span> חישוב הממוצעים
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              x̄ = Σxᵢ / {n}, ȳ = Σyᵢ / {n}
            </div>
            
            <div className="text-xs text-primary mb-2">
              <span className="font-semibold">שלב 2:</span> חישוב הנוסחה המלאה
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)² × Σ(yᵢ - ȳ)²]
            </div>
            
            <div className="text-xs text-primary mb-2">
              <span className="font-semibold">שלב 3:</span> התוצאה הסופית
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              r = {r.toFixed(8)}
            </div>
          </div>
        </div>

        <div className="bg-secondary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-secondary">מבחן מובהקות:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = r × √[(n-2)/(1-r²)]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = {r.toFixed(6)} × √[({n}-2)/(1-{r.toFixed(6)}²)]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = {r.toFixed(6)} × √[{n-2}/(1-{(r*r).toFixed(6)})]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-secondary">
              t = {tStat.toFixed(6)} (df = {n-2})
            </div>
            <div className="text-xs text-secondary">
              p-value = {pValue.toFixed(8)} ({pValue < 0.05 ? 'מובהק' : 'לא מובהק'} ב-α = 0.05)
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">פרשנות התוצאות:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• מקדם מתאם פירסון: r = {r.toFixed(6)}</p>
            <p>• כוח המתאם: {Math.abs(r) < 0.1 ? 'אין מתאם' : Math.abs(r) < 0.3 ? 'חלש' : Math.abs(r) < 0.5 ? 'בינוני' : Math.abs(r) < 0.7 ? 'חזק' : 'חזק מאוד'}</p>
            <p>• כיוון המתאם: {r > 0 ? 'חיובי (גידול באחד משפיע חיובית על השני)' : 'שלילי (גידול באחד משפיע שלילית על השני)'}</p>
            <p>• אחוז השונות המוסברת: R² = {(r*r*100).toFixed(2)}%</p>
            <p>• מובהקות סטטיסטית: {pValue < 0.05 ? 'כן' : 'לא'} (p = {pValue.toFixed(6)})</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTTestCalculations = () => {
    const t = data.coefficient || 0;
    const pValue = data.pValue || 0;
    const df = data.df || (sampleSize - 2) || 98;
    const [ci_lower, ci_upper] = data.confidence || [0, 0];
    const group1 = variables[0] || 'קבוצה ראשונה';
    const group2 = variables[1] || 'קבוצה שנייה';
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <h6 className="font-semibold mb-2">נתוני הקבוצות:</h6>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-primary">{group1}:</div>
              <div className="text-xs">נתונים מהעמודה המקורית בקובץ</div>
            </div>
            <div>
              <div className="font-semibold text-secondary">{group2}:</div>
              <div className="text-xs">נתונים מהעמודה המקורית בקובץ</div>
            </div>
          </div>
        </div>

        <div className="bg-primary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב סטטיסטי t:</h6>
          <div className="space-y-2">
            <div className="text-xs text-primary mb-2">
              <span className="font-semibold">נוסחת Welch t-test (לא מניח שונויות שוות):</span>
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = (x̄₁ - x̄₂) / √[(s₁²/n₁) + (s₂²/n₂)]
            </div>
            
            <div className="text-xs text-primary mb-2">
              <span className="font-semibold">חישוב דרגות החופש:</span>
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded">
              df = [(s₁²/n₁ + s₂²/n₂)²] / [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)]
            </div>
            
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              t = {t.toFixed(6)}, df = {df.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-secondary-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-secondary">רווח בטחון 95%:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              CI₉₅% = (x̄₁ - x̄₂) ± t₀.₀₂₅,df × SE
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-secondary">
              95% CI: [{ci_lower.toFixed(6)}, {ci_upper.toFixed(6)}]
            </div>
            <div className="text-xs text-secondary">
              פרשנות: עם ביטחון של 95%, ההפרש האמיתי בין הממוצעים נמצא בטווח זה
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">מסקנות המבחן:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• סטטיסטי המבחן: t = {t.toFixed(6)}</p>
            <p>• דרגות חופש: df = {df.toFixed(1)}</p>
            <p>• p-value = {pValue.toFixed(8)} (דו-צדדי)</p>
            <p>• מסקנה: {pValue < 0.05 ? 'יש הבדל מובהק בין הקבוצות' : 'אין הבדל מובהק בין הקבוצות'}</p>
            <p>• רמת מובהקות: α = 0.05</p>
            <p>• השוואה: "{group1}" מול "{group2}"</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left p-2 hover:bg-muted/50 rounded transition-colors"
      >
        <Calculator className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">חישובים מפורטים עם הערכים מהקובץ</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 mr-auto" />
        ) : (
          <ChevronDown className="w-4 h-4 mr-auto" />
        )}
      </button>
      
      {expanded && (
        <div className="mt-4 animate-fade-in">
          {type === 'descriptive' && renderDescriptiveCalculations()}
          {type === 'correlation' && renderCorrelationCalculations()}
          {type === 'ttest' && renderTTestCalculations()}
        </div>
      )}
    </div>
  );
};

export default DetailedCalculations;
