
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
    // Safely get values from rawData
    const variableName = variables[0] || 'המשתנה';
    const values = Array.isArray(rawData) ? rawData.slice(0, 10).map(item => {
      if (typeof item === 'object' && item !== null && variableName in item) {
        return item[variableName];
      }
      return item;
    }) : [];
    
    const n = data['מספר תצפיות'] || sampleSize || rawData.length || 0;
    const mean = data['ממוצע'] || 0;
    const std = data['סטיית תקן'] || 0;
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-muted/50 rounded-lg p-3">
          <h6 className="font-semibold mb-2">ערכי הנתונים (דוגמה מתוך {n}):</h6>
          <div className="font-mono text-xs bg-white p-2 rounded border overflow-x-auto">
            {values.length > 0 ? values.map((val, idx) => (
              <span key={idx} className="mr-2">
                x₍{idx+1}₎ = {typeof val === 'number' ? val.toFixed(2) : String(val)}
                {idx < values.length - 1 ? ',' : ''}
              </span>
            )) : (
              <span>נתונים זמינים: {n} ערכים</span>
            )}
            {values.length < n && values.length > 0 && <span>... ועוד {n - values.length} ערכים</span>}
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב הממוצע:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              x̄ = (x₁ + x₂ + ... + x₍{n}₎) / {n}
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              x̄ = {mean.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-secondary">חישוב סטיית התקן:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              s = √[Σ(xᵢ - x̄)² / (n-1)]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-secondary">
              s = {std.toFixed(6)}
            </div>
          </div>
        </div>

        <div className="bg-success/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">סיכום החישובים:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• חושב על {n} ערכים מהעמודה "{variableName}"</p>
            <p>• ממוצע: {mean.toFixed(6)}</p>
            <p>• סטיית תקן: {std.toFixed(6)}</p>
            <p>• חציון: {(data['חציון'] || 0).toFixed(6)}</p>
            <p>• טווח: {(data['מינימום'] || 0).toFixed(2)} עד {(data['מקסימום'] || 0).toFixed(2)}</p>
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
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-primary/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב מקדם המתאם:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              r = Σ[(xᵢ - x̄)(yᵢ - ȳ)] / √[Σ(xᵢ - x̄)²Σ(yᵢ - ȳ)²]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              r = {r.toFixed(8)}
            </div>
          </div>
        </div>

        <div className="bg-secondary/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-secondary">מבחן מובהקות:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = {tStat.toFixed(6)} (df = {n-2})
            </div>
            <div className="text-xs text-secondary">
              p-value = {pValue.toFixed(8)} ({pValue < 0.05 ? 'מובהק' : 'לא מובהק'})
            </div>
          </div>
        </div>

        <div className="bg-success/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">פרשנות התוצאות:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• מקדם מתאם פירסון: r = {r.toFixed(6)}</p>
            <p>• כוח המתאם: {Math.abs(r) < 0.1 ? 'אין מתאם' : Math.abs(r) < 0.3 ? 'חלש' : Math.abs(r) < 0.5 ? 'בינוני' : Math.abs(r) < 0.7 ? 'חזק' : 'חזק מאוד'}</p>
            <p>• כיוון המתאם: {r > 0 ? 'חיובי' : 'שלילי'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTTestCalculations = () => {
    const t = data.coefficient || 0;
    const pValue = data.pValue || 0;
    const df = data.df || (sampleSize - 2) || 98;
    const group1 = variables[0] || 'קבוצה ראשונה';
    const group2 = variables[1] || 'קבוצה שנייה';
    
    return (
      <div className="space-y-4 text-xs sm:text-sm">
        <div className="bg-primary/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-primary">חישוב סטטיסטי t:</h6>
          <div className="space-y-2">
            <div className="font-mono text-xs bg-white p-2 rounded">
              t = (x̄₁ - x̄₂) / √[(s₁²/n₁) + (s₂²/n₂)]
            </div>
            <div className="font-mono text-xs bg-white p-2 rounded border-2 border-primary">
              t = {t.toFixed(6)}, df = {df.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-success/10 rounded-lg p-3">
          <h6 className="font-semibold mb-2 text-success">מסקנות המבחן:</h6>
          <div className="text-xs text-success space-y-1">
            <p>• p-value = {pValue.toFixed(8)}</p>
            <p>• מסקנה: {pValue < 0.05 ? 'יש הבדל מובהק' : 'אין הבדל מובהק'}</p>
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
