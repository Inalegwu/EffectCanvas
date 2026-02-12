import { useCallback, useState } from 'react';

export const useImageLoader = () => {
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const loadImage = useCallback(
    async (url: string) => {
      if (images[url]) return images[url];

      setLoading((prev) => ({ ...prev, [url]: true }));

      return new Promise((resolve, reject) => {
        const image = new Image();

        image.crossOrigin = 'anonymous';
        image.onload = () => {
          setImages((prev) => ({ ...prev, [url]: image }));
          setLoading((prev) => ({ ...prev, [url]: false }));
          resolve(image);
        };

        image.onerror = () => {
          const err = new Error(`Failed to load image ${url}`);
          setErrors((prev) => ({ ...prev, [url]: err }));
          setLoading((prev) => ({ ...prev, [url]: false }));
          reject(err);
        };

        image.src = url;
      });
    },
    [images],
  );

  const preloadImages = useCallback(async (urls: string[]) => {
    const promises = urls.map((url) => loadImage(url).catch(() => null));
    return Promise.all(promises);
  }, []);

  return {
    images,
    loading,
    errors,
    loadImage,
    preloadImages,
  };
};
