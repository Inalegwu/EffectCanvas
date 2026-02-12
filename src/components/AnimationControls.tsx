import React, { useCallback, useState } from 'react';
import * as Types from '../canvas/types';
import { useCanvasRendererContext } from '../contexts/CanvasRendererContext';

interface AnimationControlsProps {
  images: Types.ImageSource[];
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

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
    <div
      className="animation-controls"
      style={{
        padding: '20px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ marginBottom: '15px' }}>Animation Controls</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Animation Type:
        </label>
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
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
          <option value="crossfade">Crossfade</option>
          <option value="kenBurns">Ken Burns</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Duration: {animationConfig.duration}ms
        </label>
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
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Easing:</label>
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
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="linear">Linear</option>
          <option value="easeInQuad">Ease In Quad</option>
          <option value="easeOutQuad">Ease Out Quad</option>
          <option value="easeInOutQuad">Ease In/Out Quad</option>
          <option value="spring">Spring</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          Loop Animation
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={handleStartAnimation}
          disabled={animationControls.isAnimating}
          style={{
            padding: '10px 15px',
            backgroundColor: animationControls.isAnimating
              ? '#6c757d'
              : '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: animationControls.isAnimating ? 'not-allowed' : 'pointer',
            flex: 1,
          }}
        >
          {animationControls.isAnimating ? 'Animating...' : 'Start Animation'}
        </button>

        <button
          onClick={handleQueueAnimation}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Queue Animation
        </button>
      </div>

      {animationControls.animationQueue.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '4px',
          }}
        >
          <div>
            Queue: {animationControls.animationQueue.length} animations pending
          </div>
          <button
            onClick={animationControls.clearQueue}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Queue
          </button>
        </div>
      )}
    </div>
  );
};
