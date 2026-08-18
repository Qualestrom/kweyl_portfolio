/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * Keeps output under 100KB for easy and fast Firestore storage.
 */
export async function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first, fallback to jpeg
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          if (webpDataUrl && webpDataUrl.startsWith('data:image/webp')) {
            return resolve(webpDataUrl);
          }
        } catch (_) {
          // ignore fallback to jpeg
        }

        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Returns icon classification from a URL
 */
export function getLinkIconType(rawUrl = '') {
  if (!rawUrl) return 'globe';
  const url = rawUrl.toLowerCase().trim();

  if (url.startsWith('mailto:') || (url.includes('@') && !url.includes('http'))) {
    return 'mail';
  }
  if (url.includes('github.com') || url.includes('github.io')) {
    return 'github';
  }
  if (url.includes('linkedin.com')) {
    return 'linkedin';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('discord.gg') || url.includes('discord.com')) {
    return 'discord';
  }
  if (url.includes('facebook.com') || url.includes('fb.com')) {
    return 'facebook';
  }
  if (url.includes('twitch.tv')) {
    return 'twitch';
  }
  if (url.includes('figma.com')) {
    return 'figma';
  }
  if (url.includes('dribbble.com')) {
    return 'dribbble';
  }
  if (url.includes('gitlab.com')) {
    return 'gitlab';
  }
  if (url.includes('codepen.io')) {
    return 'codepen';
  }
  if (url.includes('t.me') || url.includes('telegram.org')) {
    return 'telegram';
  }
  if (url.includes('medium.com') || url.includes('dev.to') || url.includes('hashnode.dev') || url.includes('substack.com')) {
    return 'blog';
  }
  if (url.includes('whatsapp.com') || url.includes('wa.me')) {
    return 'whatsapp';
  }
  if (url.includes('threads.net')) {
    return 'threads';
  }
  if (url.includes('reddit.com')) {
    return 'reddit';
  }
  if (url.includes('behance.net')) {
    return 'behance';
  }
  if (url.startsWith('tel:')) {
    return 'phone';
  }

  return 'globe';
}

/**
 * Ensures a URL has a protocol (https:// or mailto:) so it does not resolve relatively
 */
export function ensureAbsoluteUrl(rawUrl = '') {
  if (!rawUrl) return '#';
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

