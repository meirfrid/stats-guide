
import React, { createContext, useContext, useState } from 'react';

type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  he: {
    appTitle: 'מנתח הנתונים',
    appSubtitle: 'העלה, נתח, והורד תוצאות סטטיסטיות מלאות',
    uploadFile: 'העלאת קובץ',
    dragDropFiles: 'גרור קבצים לכאן או לחץ לבחירה',
    supportedFormats: 'פורמטים נתמכים: Excel (.xlsx, .xls), CSV (.csv)',
    maxFileSize: 'גודל מקסימלי: 50MB',
    fileUploaded: 'קובץ הועלה בהצלחה',
    analyzing: 'מבצע ניתוח...',
    analysisInstructions: 'הנחיות לניתוח',
    enterInstructions: 'תאר איזה ניתוחים סטטיסטיים תרצה לבצע...',
    quickAnalysis: 'ניתוחים מהירים',
    descriptiveStats: 'סטטיסטיקה תיאורית לכל העמודות',
    correlation: 'מתאם פירסון + פיזור',
    ttest: 'מבחן t לקבוצות עצמאיות',
    anova: 'ANOVA חד-כיוונית',
    regression: 'רגרסיה ליניארית',
    runAnalysis: 'הרץ ניתוח',
    results: 'תוצאות',
    tables: 'טבלאות',
    charts: 'גרפים',
    code: 'קוד',
    downloadResults: 'הורד תוצאות',
    downloadCode: 'הורד קוד',
    downloadPython: 'הורד Python',
    downloadR: 'הורד R',
    dataPreview: 'תצוגה מקדימה של הנתונים',
    rows: 'שורות',
    columns: 'עמודות',
    missingValues: 'ערכים חסרים',
    language: 'שפה',
    signInTitle: 'התחברות',
    signInSubtitle: 'היכנס לחשבון שלך כדי לגשת לניתוחים השמורים',
    email: 'דואר אלקטרוני',
    password: 'סיסמה',
    rememberMe: 'זכור אותי',
    forgotPassword: 'שכחת סיסמה?',
    signIn: 'התחבר',
    signingIn: 'מתחבר...',
    signInSuccess: 'התחברת בהצלחה',
    signInWelcomeBack: 'ברוך שובך! אתה מוכן להתחיל בניתוחים.',
    signInRemembered: 'אנחנו נזכור אותך בפעם הבאה.',
    emailRequired: 'יש להזין כתובת דוא"ל',
    invalidEmail: 'כתובת דוא"ל לא תקינה',
    passwordRequired: 'יש להזין סיסמה',
    passwordPlaceholder: 'הקלד סיסמה מאובטחת'
  },
  en: {
    appTitle: 'Data Analyzer',
    appSubtitle: 'Upload, analyze, and download complete statistical results',
    uploadFile: 'Upload File',
    dragDropFiles: 'Drag files here or click to select',
    supportedFormats: 'Supported formats: Excel (.xlsx, .xls), CSV (.csv)',
    maxFileSize: 'Maximum size: 50MB',
    fileUploaded: 'File uploaded successfully',
    analyzing: 'Analyzing...',
    analysisInstructions: 'Analysis Instructions',
    enterInstructions: 'Describe what statistical analyses you would like to perform...',
    quickAnalysis: 'Quick Analysis',
    descriptiveStats: 'Descriptive statistics for all columns',
    correlation: 'Pearson correlation + scatter plots',
    ttest: 'Independent t-test between groups',
    anova: 'One-way ANOVA',
    regression: 'Linear regression',
    runAnalysis: 'Run Analysis',
    results: 'Results',
    tables: 'Tables',
    charts: 'Charts',
    code: 'Code',
    downloadResults: 'Download Results',
    downloadCode: 'Download Code',
    downloadPython: 'Download Python',
    downloadR: 'Download R',
    dataPreview: 'Data Preview',
    rows: 'Rows',
    columns: 'Columns',
    missingValues: 'Missing Values',
    language: 'Language',
    signInTitle: 'Sign in',
    signInSubtitle: 'Access saved analyses with your account credentials',
    email: 'Email address',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    signInSuccess: 'Signed in successfully',
    signInWelcomeBack: 'Welcome back! You are ready to start analyzing.',
    signInRemembered: 'We will remember you next time.',
    emailRequired: 'Email address is required',
    invalidEmail: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordPlaceholder: 'Enter a secure password'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('he');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['he']] || key;
  };

  const isRTL = language === 'he';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-hebrew' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
