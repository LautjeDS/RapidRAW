export const generatePaletteFromImage = (imageUrl: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const MAX_DIM = 720;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      width = Math.max(1, width);
      height = Math.max(1, height);

      const canvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject('No canvas context');

      canvas.width = width;
      canvas.height = height;

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height).data;
      if (!imageData) return reject('No image data');

      let bestScore = -Infinity;
      let bestR = 210;
      let bestG = 215;
      let bestB = 220;

      const totalPixels = width * height;
      const pixelStep = Math.max(1, Math.floor(totalPixels / 2000));
      const dataStep = pixelStep * 4;
      const len = imageData.length;

      for (let i = 0; i < len; i += dataStep) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sum = max + min;
        const l = sum / 510;

        if (l < 0.2 || l > 0.9) continue;

        const s = max === min ? 0 : l > 0.5 ? (max - min) / (510 - sum) : (max - min) / sum;

        if (s < 0.15) continue;

        const score = s - Math.abs(l - 0.75) * 1.5;

        if (score > bestScore) {
          bestScore = score;
          bestR = r;
          bestG = g;
          bestB = b;
        }
      }

      let r = bestR;
      let g = bestG;
      let b = bestB;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < 140) {
        const t = (1 - lum / 140) * 0.8;
        r += (255 - r) * t;
        g += (255 - g) * t;
        b += (255 - b) * t;
      }

      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const chroma = mx - mn;
      if (chroma > 130) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const t = ((chroma - 130) / chroma) * 0.7;
        r += (gray - r) * t;
        g += (gray - g) * t;
        b += (gray - b) * t;
      }

      const accent = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

      resolve({
        '--app-accent': accent,
        '--app-hover-color': accent,
      });
    };

    img.onerror = (err) => {
      console.error('Failed to load image for palette generation:', err);
      reject(err);
    };

    img.src = imageUrl;
  });
};
