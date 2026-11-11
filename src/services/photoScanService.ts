/**
 * Photo scanning service for Flavor Bridge.
 * Resizes images in the browser to max 1024px, converts to base64,
 * and calls the server-side /api/scan-photo Gemini vision endpoint.
 * Photos are never saved or persisted anywhere.
 */

export interface PhotoScanResponse {
  dish_guess: string;
  ingredients: string[];
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Resizes an image file in the browser using HTML5 Canvas
 * so that neither width nor height exceeds maxDimension (1024px).
 * Returns clean JPEG base64 and mimeType.
 */
export async function resizeImageFile(
  file: File,
  maxDimension = 1024
): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG at 0.85 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const cleanBase64 = dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

        resolve({
          base64: cleanBase64,
          mimeType: 'image/jpeg',
          dataUrl,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Sends resized photo base64 to server endpoint POST /api/scan-photo
 * Enforces a 15-second client timeout and handles rate limiting.
 */
export async function scanPhotoOnServer(
  base64: string,
  mimeType = 'image/jpeg'
): Promise<PhotoScanResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/scan-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64, mimeType }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('Please wait 5 seconds before scanning another photo.');
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || errJson?.error || `Server status ${response.status}`);
    }

    const data = await response.json();
    return {
      dish_guess: String(data.dish_guess || ''),
      ingredients: Array.isArray(data.ingredients) ? data.ingredients.map(String) : [],
      confidence: ['low', 'medium', 'high'].includes(data.confidence) ? data.confidence : 'medium',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Photo scan timed out after 15 seconds.');
    }
    throw err;
  }
}
