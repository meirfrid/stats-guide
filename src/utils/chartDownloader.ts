
import html2canvas from 'html2canvas';

export interface ChartDownloadOptions {
  format: 'png' | 'svg' | 'jpg';
  quality?: number; // 0.1 to 1.0 for jpg
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export const downloadChart = async (
  chartElement: HTMLElement,
  fileName: string,
  options: ChartDownloadOptions = { format: 'png' }
): Promise<void> => {
  try {
    const { format, quality = 0.9, width, height, backgroundColor = '#ffffff' } = options;
    
    // Configure html2canvas options
    const canvasOptions = {
      backgroundColor,
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: false,
      width: width,
      height: height,
      scrollX: 0,
      scrollY: 0
    };

    const canvas = await html2canvas(chartElement, canvasOptions);
    
    // Convert to desired format
    let dataURL: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'png':
        dataURL = canvas.toDataURL('image/png');
        mimeType = 'image/png';
        fileExtension = '.png';
        break;
      case 'jpg':
        dataURL = canvas.toDataURL('image/jpeg', quality);
        mimeType = 'image/jpeg';
        fileExtension = '.jpg';
        break;
      case 'svg':
        // For SVG, we'll fall back to PNG as html2canvas doesn't support SVG export
        dataURL = canvas.toDataURL('image/png');
        mimeType = 'image/png';
        fileExtension = '.png';
        console.warn('SVG export not supported, using PNG instead');
        break;
      default:
        dataURL = canvas.toDataURL('image/png');
        mimeType = 'image/png';
        fileExtension = '.png';
    }

    // Create download link
    const link = document.createElement('a');
    link.download = `${fileName}${fileExtension}`;
    link.href = dataURL;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Chart downloaded as ${fileName}${fileExtension}`);
  } catch (error) {
    console.error('Error downloading chart:', error);
    throw new Error(`Failed to download chart: ${error}`);
  }
};

export const downloadAllCharts = async (
  charts: { element: HTMLElement; fileName: string }[],
  options: ChartDownloadOptions = { format: 'png' }
): Promise<void> => {
  const promises = charts.map(({ element, fileName }) => 
    downloadChart(element, fileName, options)
  );
  
  try {
    await Promise.all(promises);
    console.log(`Successfully downloaded ${charts.length} charts`);
  } catch (error) {
    console.error('Error downloading charts:', error);
    throw new Error(`Failed to download some charts: ${error}`);
  }
};

// Mobile-optimized download for smaller screens
export const downloadChartMobile = async (
  chartElement: HTMLElement,
  fileName: string
): Promise<void> => {
  const mobileOptions: ChartDownloadOptions = {
    format: 'png',
    width: 800,
    height: 600,
    quality: 0.8,
    backgroundColor: '#ffffff'
  };
  
  return downloadChart(chartElement, fileName, mobileOptions);
};
