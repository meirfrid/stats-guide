
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, TrendingUp, BarChart, Calculator, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalysisInstructionsProps {
  onAnalyze: (instructions: string) => void;
  isAnalyzing: boolean;
}

const AnalysisInstructions: React.FC<AnalysisInstructionsProps> = ({ onAnalyze, isAnalyzing }) => {
  const { t } = useLanguage();
  const [instructions, setInstructions] = useState('');

  const quickAnalyses = [
    {
      icon: BarChart,
      label: t('descriptiveStats'),
      prompt: 'בצע סטטיסטיקה תיאורית מלאה לכל העמודות המספריות: ממוצע, חציון, סטיית תקן, טווח, רבעונים וחסרים',
    },
    {
      icon: TrendingUp,
      label: t('correlation'),
      prompt: 'חשב מתאמי פירסון בין כל הזוגות של עמודות מספריות, הצג מפת חום של המתאמים וצור גרפי פיזור למתאמים החזקים ביותר',
    },
    {
      icon: Calculator,
      label: t('ttest'),
      prompt: 'בצע מבחן t לקבוצות עצמאיות בין שתי הקבוצות הראשונות בעמודה הקטגוריאלית הראשונה על המשתנה התלוי המספרי הראשון',
    },
    {
      icon: Brain,
      label: t('anova'),
      prompt: 'בצע ANOVA חד-כיווני לבדיקת השפעת המשתנה הקטגוריאלי הראשון על המשתנה המספרי הראשון, כולל בדיקות המשך',
    },
    {
      icon: Zap,
      label: t('regression'),
      prompt: 'בנה מודל רגרסיה ליניארית עם המשתנה המספרי הראשון כתלוי והשאר כבלתי תלויים, הצג סיכום המודל וגרפי אבחון',
    },
  ];

  const handleQuickAnalysis = (prompt: string) => {
    setInstructions(prompt);
  };

  const handleAnalyze = () => {
    if (instructions.trim()) {
      onAnalyze(instructions);
    }
  };

  return (
    <div className="analysis-card">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-secondary" />
        <h3 className="text-lg font-semibold">{t('analysisInstructions')}</h3>
      </div>

      <div className="space-y-6">
        {/* Quick Analysis Buttons */}
        <div>
          <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            {t('quickAnalysis')}
          </h4>
          <div className="grid gap-3">
            {quickAnalyses.map((analysis, index) => {
              const IconComponent = analysis.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickAnalysis(analysis.prompt)}
                  className="justify-start h-auto p-4 text-left bg-surface hover:bg-accent border-border/50 group"
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{analysis.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Custom Analysis
          </label>
          <Textarea
            placeholder={t('enterInstructions')}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-32 bg-surface border-border/50 focus:border-primary resize-none"
          />
        </div>

        {/* Analysis Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!instructions.trim() || isAnalyzing}
          className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-300 font-semibold"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('analyzing')}
            </div>
          ) : (
            t('runAnalysis')
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnalysisInstructions;
