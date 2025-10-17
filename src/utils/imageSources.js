// Small helpers to build AVIF/WebP candidates from a given image URL.
// If the URL doesn't end with a common raster extension, we don't alter it.

const EXT_PATTERN = /(\.jpg|\.jpeg|\.png)$/i;

export function buildFormatSources(url) {
  if (!url || typeof url !== 'string') {
    return { avif: null, webp: null, fallback: url };
  }
  if (!EXT_PATTERN.test(url)) {
    return { avif: null, webp: null, fallback: url };
  }
  const avif = url.replace(EXT_PATTERN, '.avif');
  const webp = url.replace(EXT_PATTERN, '.webp');
  return { avif, webp, fallback: url };
}

export const defaultSizes = `
  (max-width: 640px) 100vw,
  (max-width: 1024px) 50vw,
  33vw
`;


