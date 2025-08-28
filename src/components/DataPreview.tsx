
import React from 'react';
import { FileText, BarChart3, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataPreviewProps {
  data: any[];
  columns: string[];
  fileName: string;
}

const DataPreview: React.FC<DataPreviewProps> = ({ data, columns, fileName }) => {
  const { t } = useLanguage();

  const getColumnType = (column: string) => {
    if (data.length === 0) return 'unknown';
    
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(val => val !== null && val !== undefined);
    
    if (sampleValues.every(val => !isNaN(Number(val)))) return 'numeric';
    if (sampleValues.every(val => typeof val === 'string')) return 'text';
    return 'mixed';
  };

  const getMissingCount = (column: string) => {
    return data.filter(row => row[column] === null || row[column] === undefined || row[column] === '').length;
  };

  const displayData = data.slice(0, 100);

  return (
    <div className="analysis-card">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">{t('dataPreview')}</h3>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      </div>

      {/* Data Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-soft rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary">{data.length}</div>
          <div className="text-sm text-primary">{t('rows')}</div>
        </div>
        <div className="bg-secondary-soft rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-secondary">{columns.length}</div>
          <div className="text-sm text-secondary">{t('columns')}</div>
        </div>
        <div className="bg-warning-soft rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-warning">
            {columns.reduce((sum, col) => sum + getMissingCount(col), 0)}
          </div>
          <div className="text-sm text-warning">{t('missingValues')}</div>
        </div>
      </div>

      {/* Column Information */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Column Information
        </h4>
        <div className="grid gap-2 max-h-32 overflow-y-auto custom-scrollbar">
          {columns.map((column, index) => {
            const type = getColumnType(column);
            const missing = getMissingCount(column);
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-surface-variant rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    type === 'numeric' ? 'bg-success' :
                    type === 'text' ? 'bg-primary' : 'bg-warning'
                  }`} />
                  <span className="font-medium text-sm">{column}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{type}</span>
                  {missing > 0 && (
                    <div className="flex items-center gap-1 text-warning">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{missing} missing</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Table Preview */}
      <div className="overflow-auto max-h-96 rounded-lg border border-border/50">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="min-w-32">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="text-sm">
                    {row[column] !== null && row[column] !== undefined ? 
                      String(row[column]) : 
                      <span className="text-muted-foreground italic">null</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 100 && (
        <div className="mt-3 text-sm text-muted-foreground text-center">
          Showing first 100 rows of {data.length} total rows
        </div>
      )}
    </div>
  );
};

export default DataPreview;
