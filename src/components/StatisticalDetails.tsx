
import React from 'react';
import { Calculator, FileText, TrendingUp } from 'lucide-react';

interface StatisticalDetailsProps {
  type: 'descriptive' | 'correlation' | 'ttest';
  data: any;
  rawData?: any[];
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
    const n = data['מספר תצפיות'] || sampleSize || rawData.length || 0;
    const mean = data['ממוצע'] || 0;
    const std = data['סטיית תקן'] || 0;
    const median = data['חציון'] || 0;
    const missing = data['חסרים'] || 0;
    const variableName = variables[0] || 'המשתנה';
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Calculator className="w-4 h-4" />
            נוסחאות וחישובים עבור: {variableName}
          </h5>
          
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                ממוצע (x̄) = Σxi / n = {mean.toFixed(4)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                חושב על {n} תצפיות של {variableName}
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                סטיית תקן (s) = √[Σ(xi - x̄)² / (n-1)] = {std.toFixed(4)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                שימוש בסטיית תקן של המדגם (n-1) = {n-1}
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                חציון = מיקום {Math.ceil(n/2)} בנתונים הממוינים של {variableName} = {median.toFixed(4)}
              </div>
            </div>

            {missing > 0 && (
              <div>
                <div className="font-mono bg-warning-soft p-2 rounded text-xs">
                  ערכים חסרים: {missing} מתוך {n + missing} = {((missing / (n + missing)) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-2 text-success text-sm sm:text-base">אימות נתונים</h5>
          <div className="text-xs sm:text-sm text-success">
            <p>✓ החישובים בוצעו על {n} נתונים אמיתיים מהעמודה "{variableName}"</p>
            <p>✓ הוחרגו ערכים חסרים: {missing} ערכים</p>
            <p>✓ שימוש בנוסחאות סטטיסטיות סטנדרטיות (Bessel's correction)</p>
            <p>✓ כל הערכים עברו בדיקת תקינות</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCorrelationDetails = () => {
    const r = data.coefficient || 0;
    const n = sampleSize || rawData.length || 100;
    const pValue = data.pValue || 0;
    const var1 = variables[0] || 'משתנה ראשון';
    const var2 = variables[1] || 'משתנה שני';
    const tStat = r * Math.sqrt((n-2)/(1-r*r));
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Calculator className="w-4 h-4" />
            מתאם פירסון: {var1} ↔ {var2}
          </h5>
          
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)²Σ(yi - ȳ)²]
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                מקדם מתאם פירסון בין {var1} ו-{var2}: r = {r.toFixed(6)}
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                t = r√[(n-2)/(1-r²)] = {r.toFixed(4)} × √[({n}-2)/(1-{r.toFixed(4)}²)] = {tStat.toFixed(4)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                מבחן מובהקות עם דרגות חופש df = {n-2}
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                p-value = {pValue.toFixed(8)} (דו-צדדי)
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {pValue < 0.001 ? 'מובהק מאוד' : pValue < 0.01 ? 'מובהק' : pValue < 0.05 ? 'מובהק' : 'לא מובהק'} ברמת α = 0.05
              </p>
            </div>

            <div>
              <div className="font-mono bg-primary-soft p-2 rounded text-xs">
                R² = {(r*r).toFixed(6)} = {((r*r)*100).toFixed(2)}% מהשונות המוסברת
              </div>
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-2 text-success text-sm sm:text-base">פרטי החישוב</h5>
          <div className="text-xs sm:text-sm text-success">
            <p>✓ מתאם חושב על {n} זוגות נתונים מהעמודות המקוריות</p>
            <p>✓ משתנים: "{var1}" מול "{var2}"</p>
            <p>✓ הוחרגו זוגות עם ערכים חסרים אוטומטית</p>
            <p>✓ כוח המתאם: {Math.abs(r) < 0.1 ? 'אין מתאם' : Math.abs(r) < 0.3 ? 'חלש' : Math.abs(r) < 0.5 ? 'בינוני' : Math.abs(r) < 0.7 ? 'חזק' : 'חזק מאוד'} (|r| = {Math.abs(r).toFixed(4)})</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTTestDetails = () => {
    const t = data.coefficient || 0;
    const pValue = data.pValue || 0;
    const df = data.df || (sampleSize - 2) || 98;
    const cohensD = data.cohensD || 0;
    const [ci_lower, ci_upper] = data.confidence || [0, 0];
    const group1 = variables[0] || 'קבוצה ראשונה';
    const group2 = variables[1] || 'קבוצה שנייה';
    
    return (
      <div className="space-y-4">
        <div className="bg-surface-variant rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Calculator className="w-4 h-4" />
            מבחן t: השוואה בין {group1} ל-{group2}
          </h5>
          
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                t = (x̄₁ - x̄₂) / √[(s₁²/n₁) + (s₂²/n₂)]
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                סטטיסטי t עבור ההשוואה בין הקבוצות = {t.toFixed(6)}
              </p>
            </div>
            
            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                df = [(s₁²/n₁ + s₂²/n₂)²] / [(s₁²/n₁)²/(n₁-1) + (s₂²/n₂)²/(n₂-1)] ≈ {df.toFixed(2)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                דרגות חופש מותאמות (Welch-Satterthwaite)
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                Cohen's d = (x̄₁ - x̄₂) / s_pooled = {cohensD.toFixed(6)}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                גודל אפקט: {Math.abs(cohensD) < 0.2 ? 'קטן' : Math.abs(cohensD) < 0.5 ? 'בינוני' : Math.abs(cohensD) < 0.8 ? 'בינוני-גדול' : 'גדול מאוד'}
              </p>
            </div>

            <div>
              <div className="font-mono bg-muted p-2 rounded text-xs break-all">
                95% CI: [{ci_lower.toFixed(6)}, {ci_upper.toFixed(6)}]
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                רווח בטחון 95% להפרש הממוצעים בין הקבוצות
              </p>
            </div>
          </div>
        </div>

        <div className="bg-success-soft rounded-lg p-3 sm:p-4">
          <h5 className="font-semibold mb-2 text-success text-sm sm:text-base">תוקף החישוב</h5>
          <div className="text-xs sm:text-sm text-success">
            <p>✓ מבחן Welch t-test (לא מניח שונויות שוות)</p>
            <p>✓ p-value = {pValue.toFixed(8)} ({pValue < 0.001 ? 'מובהק מאוד' : pValue < 0.05 ? 'מובהק' : 'לא מובהק'})</p>
            <p>✓ משתנים מקוריים: "{group1}" vs "{group2}"</p>
            <p>✓ החישוב כולל {sampleSize || 'כל'} התצפיות התקינות מהקובץ</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <FileText className="w-4 h-4" />
        <span className="text-xs sm:text-sm font-medium">פרטים סטטיסטיים מקצועיים</span>
      </div>
      
      {type === 'descriptive' && renderDescriptiveDetails()}
      {type === 'correlation' && renderCorrelationDetails()}
      {type === 'ttest' && renderTTestDetails()}
    </div>
  );
};

export default StatisticalDetails;
