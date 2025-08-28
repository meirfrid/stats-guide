
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const { t } = useLanguage();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError('');
    
    if (fileRejections.length > 0) {
      setError('Invalid file format or size too large');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  return (
    <div className="analysis-card">
      <div
        {...getRootProps()}
        className={`upload-zone cursor-pointer ${isDragActive ? 'dragover' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          {uploadedFile ? (
            <>
              <CheckCircle className="w-16 h-16 text-success mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('fileUploaded')}
              </h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm">{uploadedFile.name}</span>
                <span className="text-xs">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-primary mb-4 animate-bounce-gentle" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('dragDropFiles')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('supportedFormats')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('maxFileSize')}
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-error">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {uploadedFile && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUploadedFile(null);
              setError('');
            }}
          >
            Upload Different File
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
