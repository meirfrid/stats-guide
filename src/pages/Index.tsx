import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import AnalysisInstructions from '@/components/AnalysisInstructions';
import AnalysisResults from '@/components/AnalysisResults';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, Sparkles } from 'lucide-react';
import { generateAnalysisResults, downloadResults, downloadCode } from '@/utils/analysisEngine';
import { useToast } from '@/hooks/use-toast';

interface ParsedData {
  data: any[];
  columns: string[];
  fileName: string;
}

interface AnalysisResult {
  type: 'descriptive' | 'correlation' | 'ttest' | 'chart';
  title: string;
  data?: any;
  chart?: {
    type: 'bar' | 'line' | 'scatter';
    data: any[];
    xKey: string;
    yKey: string;
  };
  summary?: string;
  pValue?: number;
  coefficient?: number;
  confidence?: [number, number];
}

const MainContent: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
  const [analysisInstructions, setAnalysisInstructions] = useState<string>('');

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
      // Reset previous results when new file is uploaded
      setAnalysisResults(null);
      setAnalysisInstructions('');
      
      toast({
        title: "File uploaded successfully",
        description: `${parsed.data.length} rows loaded from ${file.name}`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Error uploading file",
        description: "Please check the file format and try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = (instructions: string) => {
    if (!parsedData) {
      toast({
        title: "No data available",
        description: "Please upload a file first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisInstructions(instructions);
    
    // Simulate analysis time
    setTimeout(() => {
      try {
        const results = generateAnalysisResults(parsedData, instructions);
        setAnalysisResults(results);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis completed",
          description: `Generated ${results.length} analysis results`,
        });
      } catch (error) {
        console.error('Error during analysis:', error);
        setIsAnalyzing(false);
        toast({
          title: "Analysis failed",
          description: "An error occurred during analysis. Please try again.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleDownloadResults = () => {
    if (analysisResults && parsedData) {
      downloadResults(analysisResults, parsedData.fileName);
      toast({
        title: "Results downloaded",
        description: "Analysis results have been saved as CSV file",
      });
    }
  };

  const handleDownloadCode = () => {
    if (analysisResults && parsedData) {
      downloadCode(analysisResults, parsedData.fileName, analysisInstructions);
      toast({
        title: "Code downloaded",
        description: "Python analysis script has been generated",
      });
    }
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
            {parsedData && !analysisResults && (
              <section className="animate-slide-up">
                <DataPreview
                  data={parsedData.data}
                  columns={parsedData.columns}
                  fileName={parsedData.fileName}
                />
              </section>
            )}

            {/* Analysis Results */}
            {analysisResults && parsedData && (
              <section className="animate-slide-up">
                <AnalysisResults
                  results={analysisResults}
                  instructions={analysisInstructions}
                  fileName={parsedData.fileName}
                  onDownloadResults={handleDownloadResults}
                  onDownloadCode={handleDownloadCode}
                />
              </section>
            )}

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <section className="analysis-card animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">{t('analyzing')}</h3>
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
