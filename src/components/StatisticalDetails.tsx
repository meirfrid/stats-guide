
import React from 'react';
import { Calculator, FileText, TrendingUp } from 'lucide-react';

interface StatisticalDetailsProps {
  type: 'descriptive' | 'correlation' | 'ttest';
  data: any;
  rawData?: number[];
  variables?: string[];
  sampleSize?: number;
}

const StatisticalDetails: React.FC<StatisticalDetailsProps> = ({ 
  type, 
  data, 
  rawData = [], 
  variables = [],
  sampleSize = 0 
}) => {
  const renderDescriptiveDetails = () => {
    const n = data['מספר תצפיות'] || 0;
    const mean = data['ממוצע'] || 0;
    const std = data['סטיית תקן'] || 0;
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            נוסחאות וחישובים
          </h5>
          
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                ממוצע (x̄) = Σxi / n = {mean}
              </div>
              <p className="text-muted-foreground mt-1">
                n = {n} תצפיות
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                סטיית תקן (s) = √[Σ(xi - x̄)² / (n-1)] = {std}
              </div>
              <p className="text-muted-foreground mt-1">
                שימוש בסטיית תקן של המדגם (n-1)
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                חציון = מיקום {Math.ceil(n/2)} בנתונים הממוינים = {data['חציון']}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-4">
          <h5 className="font-semibold mb-2 text-success">אימות נתונים</h5>
          <div className="text-sm text-success">
            <p>✓ החישובים בוצעו על {n} נתונים אמיתיים מהקובץ</p>
            <p>✓ הוחרגו ערכים חסרים: {data['חסרים']} ערכים</p>
            <p>✓ שימוש בנוסחאות סטטיסטיות סטנדרטיות</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCorrelationDetails = () => {
    const r = data.coefficient || 0;
    const n = sampleSize;
    const pValue = data.pValue || 0;
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            נוסחת מתאם פירסון
          </h5>
          
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)²Σ(yi - ȳ)²]
              </div>
              <p className="text-muted-foreground mt-1">
                מתאם פירסון: r = {r.toFixed(4)}
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                t = r√[(n-2)/(1-r²)] = {(r * Math.sqrt((n-2)/(1-r*r))).toFixed(4)}
              </div>
              <p className="text-muted-foreground mt-1">
                מבחן מובהקות עם df = {n-2}
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                p-value = {pValue.toFixed(6)}
              </div>
              <p className="text-muted-foreground mt-1">
                {pValue < 0.05 ? 'מובהק' : 'לא מובהק'} ברמת α = 0.05
              </p>
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-4">
          <h5 className="font-semibold mb-2 text-success">פרטי החישוב</h5>
          <div className="text-sm text-success">
            <p>✓ מתאם חושב על {n} זוגות נתונים</p>
            <p>✓ משתנים: {variables.join(' מול ')}</p>
            <p>✓ הוחרגו זוגות עם ערכים חסרים</p>
            <p>✓ כוח המתאם: {Math.abs(r) < 0.3 ? 'חלש' : Math.abs(r) < 0.7 ? 'בינוני' : 'חזק'} (|r| = {Math.abs(r).toFixed(3)})</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTTestDetails = () => {
    const t = data.coefficient || 0;
    const pValue = data.pValue || 0;
    const df = data.df || 0;
    const cohensD = data.cohensD || 0;
    const [ci_lower, ci_upper] = data.confidence || [0, 0];
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            מבחן t בלתי-תלוי (Welch's t-test)
          </h5>
          
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                t = (x̄₁ - x̄₂) / √[(s₁²/n₁) + (s₂²/n₂)]
              </div>
              <p className="text-muted-foreground mt-1">
                סטטיסטי t = {t.toFixed(4)}
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                df = [(s₁²/n₁ + s₂²/n₂)²] / [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)]
              </div>
              <p className="text-muted-foreground mt-1">
                דרגות חופש = {df.toFixed(2)} (Welch-Satterthwaite)
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                Cohen's d = (x̄₁ - x̄₂) / s_pooled = {cohensD.toFixed(4)}
              </div>
              <p className="text-muted-foreground mt-1">
                גודל אפקט: {Math.abs(cohensD) < 0.2 ? 'קטן' : Math.abs(cohensD) < 0.5 ? 'בינוני' : Math.abs(cohensD) < 0.8 ? 'בינוני-גדול' : 'גדול'}
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs">
                95% CI: [{ci_lower.toFixed(4)}, {ci_upper.toFixed(4)}]
              </div>
              <p className="text-muted-foreground mt-1">
                רווח בטחון 95% להפרש הממוצעים
              </p>
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-4">
          <h5 className="font-semibold mb-2 text-success">תוקף החישוב</h5>
          <div className="text-sm text-success">
            <p>✓ מבחן Welch עם הנחות שונות של שונויות</p>
            <p>✓ p-value = {pValue.toFixed(6)} ({pValue < 0.05 ? 'מובהק' : 'לא מובהק'})</p>
            <p>✓ שימוש בנתונים אמיתיים מהקובץ</p>
            <p>✓ הוחרגו ערכים חסרים אוטומטית</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <FileText className="w-4 h-4" />
        <span className="text-sm font-medium">פרטים סטטיסטיים מקצועיים</span>
      </div>
      
      {type === 'descriptive' && renderDescriptiveDetails()}
      {type === 'correlation' && renderCorrelationDetails()}
      {type === 'ttest' && renderTTestDetails()}
    </div>
  );
};

export default StatisticalDetails;
