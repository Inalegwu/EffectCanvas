import { useCallback, useState } from 'react';
import * as Types from '../canvas/types';

export const useAnimationControls = (api: Types.CanvasRendererAPI | null) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationQueue, setAnimationQueue] = useState<
    Array<{
      from: Types.ImageSource;
      to: Types.ImageSource;
      config: Types.AnimationConfig;
    }>
  >([]);

  const animate = useCallback(
    async (
      from: Types.ImageSource,
      to: Types.ImageSource,
      config: Types.AnimationConfig,
    ) => {
      if (!api) throw new Error('API Not Available');

      setIsAnimating(true);

      try {
        api.animateTransition(from, to, config);
      } finally {
        setIsAnimating(false);
        if (animationQueue?.length > 0) {
          const next = animationQueue[0];
          setAnimationQueue((prev) => prev.slice(1));
          animate(next.from, next.to, next.config);
        }
      }
    },
    [api, animationQueue],
  );

  const queueAnimation = useCallback(
    (
      from: Types.ImageSource,
      to: Types.ImageSource,
      config: Types.AnimationConfig,
    ) => {
      setAnimationQueue((prev) => [...prev, { from, to, config }]);

      if (!isAnimating && animationQueue.length === 0) {
        animate(from, to, config);
      }
    },
    [animate, isAnimating, animationQueue.length],
  );

  const clearQueue = useCallback(() => {
    setAnimationQueue([]);
  }, []);

  return {
    isAnimating,
    animationQueue,
    animate,
    queueAnimation,
    clearQueue,
  };
};
