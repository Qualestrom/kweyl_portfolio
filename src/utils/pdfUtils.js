import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker from a reliable CDN matching the installed pdfjs-dist version
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

/**
 * Checks whether a given file or URL is a PDF document
 */
export function isPdfFile(fileOrUrl) {
  if (!fileOrUrl) return false;
  if (typeof fileOrUrl === 'string') {
    return fileOrUrl.toLowerCase().split('?')[0].endsWith('.pdf');
  }
  return fileOrUrl.type === 'application/pdf' || fileOrUrl.name?.toLowerCase().endsWith('.pdf');
}

/**
 * Renders the first page of a PDF File/Blob or ArrayBuffer to a high-resolution Image Blob
 * @param {File|Blob|ArrayBuffer} pdfSource 
 * @param {number} scale Default 2.0 for crisp retina resolution
 * @returns {Promise<{ blob: Blob, dataUrl: string, width: number, height: number }>}
 */
export async function renderPdfFirstPageToImage(pdfSource, scale = 2.0) {
  let arrayBuffer;
  if (pdfSource instanceof ArrayBuffer) {
    arrayBuffer = pdfSource;
  } else if (pdfSource instanceof Blob || pdfSource instanceof File) {
    arrayBuffer = await pdfSource.arrayBuffer();
  } else {
    throw new Error('Invalid PDF source provided');
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Fill canvas with white background before rendering
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL('image/webp', 0.92),
          width: canvas.width,
          height: canvas.height,
        });
      },
      'image/webp',
      0.92
    );
  });
}
