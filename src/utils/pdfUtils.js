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

  // Fill canvas with clean white background before rendering
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

/**
 * Smart Scanner: Extracts Certificate Title, Issuer, and Date from PDF text layer
 * @param {File|Blob|ArrayBuffer} pdfSource
 * @returns {Promise<{ title: string, issuer: string, date: string }>}
 */
export async function extractPdfCertificateMetadata(pdfSource) {
  let arrayBuffer;
  if (pdfSource instanceof ArrayBuffer) {
    arrayBuffer = pdfSource;
  } else if (pdfSource instanceof Blob || pdfSource instanceof File) {
    arrayBuffer = await pdfSource.arrayBuffer();
  } else {
    return { title: '', issuer: '', date: '' };
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    
    // Extract non-empty text items in visual order
    const rawItems = textContent.items
      .map(item => (typeof item.str === 'string' ? item.str.trim() : ''))
      .filter(str => str.length > 0);

    const fullText = rawItems.join(' ');

    let scannedTitle = '';
    let scannedIssuer = '';
    let scannedDate = '';

    // ── 1. Smart Title Detection ──────────────────────────────────────────────
    // Check for phrases leading into the title
    const completionTriggers = [
      /for\s+successfully\s+completing/i,
      /successfully\s+completing/i,
      /successfully\s+completed/i,
      /has\s+successfully\s+completed/i,
      /completed\s+the\s+requirements\s+for/i,
      /certificate\s+of\s+completion\s+in/i,
      /certificate\s+of\s+achievement\s+in/i,
      /awarded\s+to\s+[a-zA-Z\s]+\s+for/i
    ];

    for (let i = 0; i < rawItems.length; i++) {
      const item = rawItems[i];
      for (const trigger of completionTriggers) {
        if (trigger.test(item)) {
          // The title is typically the very next line (or lines)
          if (i + 1 < rawItems.length) {
            let candidate = rawItems[i + 1];
            // If the line is short and followed by another, join them
            if (candidate.length < 25 && i + 2 < rawItems.length && !/offered by|through|date|instructor/i.test(rawItems[i + 2])) {
              candidate = `${candidate} ${rawItems[i + 2]}`;
            }
            if (!/offered by|through|date|instructor|signed/i.test(candidate)) {
              scannedTitle = candidate;
              break;
            }
          }
        }
      }
      if (scannedTitle) break;
    }

    // Fallback title detection: look for prominent certification keywords
    if (!scannedTitle) {
      const certKeywords = /\b(CCNA|CCNP|AWS|Google Cloud|Certified|Specialization|Solutions Architect|Developer|Engineer|Administrator|Associate|Professional|Full Stack|React|Flutter|Python|JavaScript)\b/i;
      for (const item of rawItems) {
        if (certKeywords.test(item) && item.length > 4 && item.length < 90) {
          if (!/this certificate|is awarded to|for successfully/i.test(item)) {
            scannedTitle = item;
            break;
          }
        }
      }
    }

    // ── 2. Smart Issuer Detection ─────────────────────────────────────────────
    const knownIssuers = [
      { name: 'Cisco Networking Academy', pattern: /cisco\s+networking\s+academy|cisco/i },
      { name: 'Amazon Web Services', pattern: /amazon\s+web\s+services|aws/i },
      { name: 'Google Cloud', pattern: /google\s+cloud|google/i },
      { name: 'Meta', pattern: /\bmeta\b/i },
      { name: 'Microsoft', pattern: /\bmicrosoft\b/i },
      { name: 'Coursera', pattern: /\bcoursera\b/i },
      { name: 'Udemy', pattern: /\budemy\b/i },
      { name: 'Frontend Masters', pattern: /frontend\s+masters/i },
      { name: 'freeCodeCamp', pattern: /freecodecamp/i },
      { name: 'University of Helsinki', pattern: /university\s+of\s+helsinki/i },
      { name: 'Batangas State University', pattern: /batangas\s+state\s+university/i },
      { name: 'CNCF', pattern: /\bcncf\b|cloud\s+native\s+computing/i },
      { name: 'CompTIA', pattern: /\bcomptia\b/i },
      { name: 'Oracle', pattern: /\boracle\b/i },
      { name: 'IBM', pattern: /\bibm\b/i },
      { name: 'edX', pattern: /\bedx\b/i },
    ];

    // Priority: Look for recognized organization names
    for (const issuer of knownIssuers) {
      if (issuer.pattern.test(fullText)) {
        scannedIssuer = issuer.name;
        break;
      }
    }

    // Secondary fallback: Look for "offered by [Organization]" or "issued by [Organization]"
    if (!scannedIssuer) {
      for (const item of rawItems) {
        const match = item.match(/(?:offered by|issued by|presented by)\s+([A-Za-z0-9\s&,.-]+)/i);
        if (match && match[1] && match[1].trim().length > 3) {
          scannedIssuer = match[1].trim().replace(/\s+(through|on|at)\s+.*$/i, '');
          break;
        }
      }
    }

    // ── 3. Smart Date Detection ───────────────────────────────────────────────
    // Check for full dates e.g. "28 May 2025", "May 28, 2025", "28/05/2025"
    const fullDateRegex = /\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4})\b/i;
    const monthYearRegex = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4})\b/i;
    const isoDateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2})\b/;
    const yearRegex = /\b(20\d{2})\b/;

    const fullDateMatch = fullText.match(fullDateRegex);
    if (fullDateMatch) {
      scannedDate = fullDateMatch[1].trim();
    } else {
      const monthYearMatch = fullText.match(monthYearRegex);
      if (monthYearMatch) {
        scannedDate = monthYearMatch[1].trim();
      } else {
        const isoMatch = fullText.match(isoDateRegex);
        if (isoMatch) {
          scannedDate = isoMatch[1].trim();
        } else {
          // Check for lines near "Completion Date" or "Date"
          for (let i = 0; i < rawItems.length; i++) {
            if (/completion\s+date|issue\s+date|date\s+issued/i.test(rawItems[i])) {
              if (i > 0 && yearRegex.test(rawItems[i - 1])) {
                scannedDate = rawItems[i - 1].trim();
                break;
              } else if (i + 1 < rawItems.length && yearRegex.test(rawItems[i + 1])) {
                scannedDate = rawItems[i + 1].trim();
                break;
              }
            }
          }
          if (!scannedDate) {
            const yearMatch = fullText.match(yearRegex);
            if (yearMatch) {
              scannedDate = yearMatch[1].trim();
            }
          }
        }
      }
    }

    return {
      title: scannedTitle ? scannedTitle.replace(/\s+/g, ' ').trim() : '',
      issuer: scannedIssuer ? scannedIssuer.trim() : '',
      date: scannedDate ? scannedDate.trim() : '',
    };
  } catch (err) {
    console.warn('PDF metadata scanner notice:', err);
    return { title: '', issuer: '', date: '' };
  }
}
