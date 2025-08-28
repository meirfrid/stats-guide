
interface ParsedData {
  data: any[];
  columns: string[];
  fileName: string;
}

export const parseCSV = (text: string): { data: any[], columns: string[] } => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { data: [], columns: [] };
  }

  // Parse CSV properly handling quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(field => field.replace(/^"|"$/g, ''));
  };

  const headers = parseLine(lines[0]);
  const data = lines.slice(1).map(line => {
    const values = parseLine(line);
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to convert to number if possible
      const numValue = Number(value);
      row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
    });
    
    return row;
  });

  return { data, columns: headers };
};

export const parseFile = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { data, columns } = parseCSV(text);
        
        resolve({
          data,
          columns,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Use UTF-8 encoding by default
    reader.readAsText(file, 'UTF-8');
  });
};
