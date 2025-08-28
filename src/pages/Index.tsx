
import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import AnalysisInstructions from '@/components/AnalysisInstructions';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Sparkles, Download, Code } from 'lucide-react';

interface ParsedData {
  data: any[];
  columns: string[];
  fileName: string;
}

const MainContent: React.FC = () => {
  const { t } = useLanguage();
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock CSV parser - in real implementation, use a proper CSV/Excel parsing library
  const parseFile = (file: File): Promise<ParsedData> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            row[header] = isNaN(Number(value)) ? value : Number(value);
          });
          return row;
        });

        resolve({
          data,
          columns: headers,
          fileName: file.name
        });
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      const parsed = await parseFile(file);
      setParsedData(parsed);
    } catch (error) {
      console.error('Error parsing file:', error);
    }
  };

  const handleAnalyze = (instructions: string) => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      // Here would be the actual analysis logic
      console.log('Analysis instructions:', instructions);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">{t('appTitle')}</h1>
                  <p className="text-sm text-muted-foreground">{t('appSubtitle')}</p>
                </div>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Instructions */}
          <div className="space-y-6 animate-fade-in">
            {/* File Upload */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{t('uploadFile')}</h2>
              </div>
              <FileUpload onFileUpload={handleFileUpload} />
            </section>

            {/* Analysis Instructions */}
            {parsedData && (
              <section className="animate-slide-up">
                <AnalysisInstructions 
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </section>
            )}
          </div>

          {/* Right Column - Preview & Results */}
          <div className="space-y-6">
            {/* Data Preview */}
            {parsedData && (
              <section className="animate-slide-up">
                <DataPreview
                  data={parsedData.data}
                  columns={parsedData.columns}
                  fileName={parsedData.fileName}
                />
              </section>
            )}

            {/* Analysis Results Placeholder */}
            {isAnalyzing && (
              <section className="analysis-card animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">{t('results')}</h3>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse shimmer" />
                  ))}
                </div>
                
                <div className="mt-6 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>{t('analyzing')}</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Floating Actions */}
        {parsedData && !isAnalyzing && (
          <div className="floating-panel animate-fade-in">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-success text-success-foreground rounded-lg hover:bg-success-hover transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                {t('downloadResults')}
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition-colors text-sm font-medium">
                <Code className="w-4 h-4" />
                {t('downloadCode')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
};

export default Index;
