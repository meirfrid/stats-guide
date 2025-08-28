import * as XLSX from 'xlsx';

interface ParsedData {
  data: any[];
  columns: string[];
  fileName: string;
}

/**
 * Decode an ArrayBuffer to string, trying UTF-8 first, then Windows-1255 and ISO-8859-8 for Hebrew.
 */
const decodeWithFallback = (buffer: ArrayBuffer): string => {
  const tryDecode = (encoding: string) => {
    try {
      const dec = new TextDecoder(encoding as any, { fatal: false });
      return dec.decode(buffer);
    } catch (e) {
      return '';
    }
  };

  let text = tryDecode('utf-8');
  // Heuristic: if many replacement chars or almost all non-ASCII, try Hebrew encodings
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  if (!text || replacementCount > 0) {
    const win1255 = tryDecode('windows-1255');
    if (win1255 && (win1255.match(/\uFFFD/g) || []).length < replacementCount) {
      text = win1255;
    } else {
      const iso88598 = tryDecode('iso-8859-8');
      if (iso88598 && (iso88598.match(/\uFFFD/g) || []).length < replacementCount) {
        text = iso88598;
      }
    }
  }

  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  return text;
};

const countDelimiterOutsideQuotes = (line: string, delimiter: string): number => {
  let inQuotes = false;
  let count = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      count++;
    }
  }
  return count;
};

const detectDelimiter = (lines: string[]): string => {
  const candidates = [',', ';', '\t', '|'];
  const sample = lines.slice(0, Math.min(10, lines.length));
  const scores = candidates.map(d => {
    const counts = sample.map(line => countDelimiterOutsideQuotes(line, d));
    const sum = counts.reduce((a, b) => a + b, 0);
    return { d, sum };
  });
  // Pick the delimiter with the highest total count; default to comma if tie/zero
  const best = scores.sort((a, b) => b.sum - a.sum)[0];
  return best && best.sum > 0 ? best.d : ',';
};

const parseLine = (line: string, delimiter: string): string[] => {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Escaped quotes inside quoted field ("")
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  // Trim and remove surrounding quotes
  return out.map(f => {
    const trimmed = f.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  });
};

const tryParseNumber = (value: any, delimiter: string): any => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;

  const v = value.trim();
  if (v === '') return '';

  // Only attempt numeric parse on strings composed of digits, separators, sign
  if (!/^-?[\d.,]+$/.test(v)) return value;

  let normalized = v;
  if (delimiter === ';') {
    // Common in Hebrew CSV: '.' thousands, ',' decimal
    normalized = normalized.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // Assume '.' decimal, ',' thousands
    // Remove thousands commas
    const parts = normalized.split('.');
    if (parts.length <= 2) {
      normalized = normalized.replace(/,/g, '');
    }
  }

  const num = Number(normalized);
  return Number.isFinite(num) ? num : value;
};

export const parseCSV = (text: string): { data: any[], columns: string[] } => {
  const lines = text
    .split(/\r?\n/)
    .filter(line => line !== null && line !== undefined && line.trim().length > 0);

  if (lines.length === 0) {
    return { data: [], columns: [] };
  }

  const delimiter = detectDelimiter(lines);
  console.log('[csvParser] Detected delimiter:', JSON.stringify(delimiter));

  const headersRaw = parseLine(lines[0], delimiter);
  const headers = headersRaw.map((h, idx) => (h && h.length ? String(h) : `Column_${idx + 1}`));

  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    const row: any = {};
    headers.forEach((header, idx) => {
      const val = values[idx] !== undefined ? values[idx] : '';
      row[header] = tryParseNumber(val, delimiter);
    });
    rows.push(row);
  }

  return { data: rows, columns: headers };
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });

const parseExcel = async (buffer: ArrayBuffer): Promise<{ data: any[]; columns: string[] }> => {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) return { data: [], columns: [] };

  // Get as array-of-arrays to control headers
  const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!aoa || aoa.length === 0) return { data: [], columns: [] };

  const headerRow = aoa[0] as any[];
  const headers = headerRow.map((h, idx) => (h !== undefined && h !== null && h !== '' ? String(h) : `Column_${idx + 1}`));

  const data: any[] = [];
  for (let r = 1; r < aoa.length; r++) {
    const rowArr = aoa[r] || [];
    const row: any = {};
    headers.forEach((h, cIdx) => {
      const cellVal = rowArr[cIdx];
      // XLSX already preserves numeric cells as numbers. Keep them; otherwise attempt number parse if string.
      row[h] = typeof cellVal === 'string' ? tryParseNumber(cellVal, ',') : cellVal;
    });
    data.push(row);
  }

  return { data, columns: headers };
};

export const parseFile = async (file: File): Promise<ParsedData> => {
  console.log('[csvParser] Parsing file:', file.name, file.type);
  const ext = file.name.toLowerCase().split('.').pop();

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await readFileAsArrayBuffer(file);
    const { data, columns } = await parseExcel(buffer);
    console.log('[csvParser] Excel parsed:', { rows: data.length, cols: columns.length });
    return { data, columns, fileName: file.name };
  }

  // Default: treat as CSV/text
  const buffer = await readFileAsArrayBuffer(file);
  const text = decodeWithFallback(buffer);
  const { data, columns } = parseCSV(text);
  console.log('[csvParser] CSV parsed:', { rows: data.length, cols: columns.length, sampleHeaders: columns.slice(0, 10) });

  return {
    data,
    columns,
    fileName: file.name
  };
};
