
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-surface hover:bg-accent border-border/50"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'he' ? 'English' : 'עברית'}
      </span>
    </Button>
  );
};

export default LanguageToggle;
