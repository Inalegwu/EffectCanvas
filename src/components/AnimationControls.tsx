import { DangerTriangle } from '@solar-icons/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import * as Types from '../canvas/types';
import { useCanvasRendererContext } from '../contexts/CanvasRendererContext';

type Easings = {
  label: string;
  value: Types.AnimationConfig['easing'];
};

interface AnimationControlsProps {
  images: Types.ImageSource[];
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

const easingFunctions: Array<Easings> = [
  {
    label: 'Ease In/Out Quad',
    value: 'easeInOutQuad',
  },
  {
    label: 'Ease In Cubic',
    value: 'easeInCubic',
  },
  {
    label: 'Ease In/Out Cubic',
    value: 'easeInOutCubic',
  },
  {
    label: 'Ease In Quad',
    value: 'easeInQuad',
  },
  {
    label: 'Ease Out Cubic',
    value: 'easeOutCubic',
  },
  {
    label: 'Ease Out Quad',
    value: 'easeOutQuad',
  },
  {
    label: 'Linear',
    value: 'linear',
  },
  {
    label: 'Spring',
    value: 'spring',
  },
];

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  images,
  onAnimationStart,
  onAnimationEnd,
}) => {
  const { animationControls } = useCanvasRendererContext();
  const [animationConfig, setAnimationConfig] = useState<Types.AnimationConfig>(
    new Types.AnimationConfig({
      type: 'fade',
      duration: 1000,
      easing: 'easeInOutQuad',
      direction: 'both',
      loop: false,
    }),
  );

  const handleStartAnimation = useCallback(async () => {
    if (images.length < 2) return;

    const from = images[0];
    const to = images[1];

    onAnimationStart?.();
    try {
      await animationControls.animate(from, to, animationConfig);
    } finally {
      onAnimationEnd?.();
    }
  }, [
    images,
    animationControls,
    animationConfig,
    onAnimationStart,
    onAnimationEnd,
  ]);

  const handleQueueAnimation = useCallback(() => {
    if (images.length < 2) return;

    const from = images[0];
    const to = images[1];
    animationControls.queueAnimation(from, to, animationConfig);
  }, [images, animationControls, animationConfig]);

  return (
    <div className="flex flex-col w-full gap-2 overflow-y-scroll pb-2">
      <h3 className="text-neutral-400 text-sm mx-3">Animation Controls</h3>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">Animation Type</p>
        <select
          value={animationConfig.type}
          onChange={(e) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  type: e.target.value as Types.AnimationConfig['type'],
                }),
            )
          }
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
          <option value="crossfade">Crossfade</option>
          <option value="kenBurns">Ken Burns</option>
        </select>
      </div>

      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Duration: {animationConfig.duration}ms
        </p>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={animationConfig.duration}
          onChange={(e) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  duration: parseInt(e.target.value),
                }),
            )
          }
        />
      </div>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">Easing</p>
        <select
          value={animationConfig.easing}
          onChange={(e) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  easing: e.target.value as Types.EasingFunction,
                }),
            )
          }
        >
          <option value="linear">Linear</option>
          <option value="easeInQuad">Ease In Quad</option>
          <option value="easeOutQuad">Ease Out Quad</option>
          <option value="easeInOutQuad">Ease In/Out Quad</option>
          <option value="spring">Spring</option>
        </select>
      </div>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">Loop Animation</p>
        <input
          type="checkbox"
          checked={animationConfig.loop}
          onChange={(e) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  loop: e.target.checked,
                }),
            )
          }
        />
      </div>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <button
          className="text-xs text-neutral-300"
          onClick={handleStartAnimation}
          disabled={animationControls.isAnimating}
        >
          {animationControls.isAnimating ? 'Animating...' : 'Start Animation'}
        </button>
        <button
          className="text-xs text-accent-600"
          onClick={handleQueueAnimation}
        >
          Queue Animation
        </button>
      </div>
      {animationControls.animationQueue.length > 0 && (
        <div className="my-1 px-3 py-2 mx-3 text-neutral-500 border border-dotted border-neutral-900 flex items-center justify-between gap-2 text-xs">
          <DangerTriangle size={14} weight="Bold" />
          <div>
            Queue: {animationControls.animationQueue.length} animations pending
          </div>
          <button
            className="text-red-700 underline italic underline-offset-1"
            onClick={animationControls.clearQueue}
          >
            Clear Queue
          </button>
        </div>
      )}
    </div>
  );
};
