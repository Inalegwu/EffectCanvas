import { Checkbox, Field, Select, Slider } from '@base-ui/react';
import { AltArrowDown, CheckCircle, DangerTriangle } from '@solar-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import * as Types from '../canvas/types';
import { useCanvasRendererContext } from '../contexts/CanvasRendererContext';

type Easings = {
  label: string;
  value: Types.AnimationConfig['easing'];
};

type AnimTypes = {
  label: string;
  value: Types.AnimationConfig['type'];
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

const animationTypes: Array<AnimTypes> = [
  {
    label: 'Zoom',
    value: 'zoom',
  },
  {
    label: 'Slid',
    value: 'slide',
  },
  {
    label: 'Ken Burns',
    value: 'kenBurns',
  },
  {
    label: 'Fade',
    value: 'fade',
  },
  {
    label: 'Dissolve',
    value: 'dissolve',
  },
  {
    label: 'Cross Fade',
    value: 'crossfade',
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
      <Field.Root className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <Field.Label className="text-xs text-neutral-500">
          Animation Type
        </Field.Label>{' '}
        <Select.Root
          onValueChange={(value) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  type: value as Types.AnimationConfig['type'],
                }),
            )
          }
          defaultValue={animationConfig.type}
          items={animationTypes}
          value={animationConfig.type}
        >
          <Select.Trigger className="border gap-3 border-solid border-neutral-900 flex items-center justify-center text-neutral-300 px-3 py-1">
            <Select.Value
              className="data-placeholder:opacity-60 text-xs"
              placeholder="Filter"
            />
            <AltArrowDown size={13} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              className="outline-none select-none z-20"
              sideOffset={8}
            >
              <Select.ScrollUpArrow />
              <Select.Popup className="group min-w-(--anchor-width) origin-(--transform-origin) bg-clip-padding bg-black text-neutral-300 shadow-lg shadow-neutral-700 outline outline-neutral-900 data-ending-style:scale-90 data-ending-style:opacity-0 data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-90 data-starting-style:opacity-0 data-side-none:data-starting-style:scale-100 data-side=none:data-starting-style:opacity-100 data-side-none:data-starting-style:transition-none dark:shadow-none dark:outline-neutral-900">
                <Select.Arrow />
                <Select.List>
                  {animationTypes.map((item) => (
                    <Select.Item
                      className="flex items-center hover:bg-neutral-900/50 cursor-pointer justify-between gap-2 text-xs border-b border-b-solid border-b-neutral-900 p-2"
                      key={item.label}
                      value={item.value}
                    >
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <CheckCircle
                          weight="Bold"
                          className="text-accent-500"
                          size={12}
                        />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
              <Select.ScrollDownArrow />
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Field.Root>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Duration: {animationConfig.duration}ms
        </p>
        <Slider.Root
          defaultValue={animationConfig.duration}
          onValueChange={(e) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  duration: e,
                }),
            )
          }
          className="w-40"
          min={100}
          max={5000}
          step={100}
        >
          <Slider.Control className="flex w-full touch-none items-center select-none">
            <Slider.Track className="h-1 w-full bg-neutral-900 shadow-[inset_0_0_0_1px] shadow-neutral-800 select-none">
              <Slider.Indicator className="bg-neutral-700 select-none" />
              <Slider.Thumb
                aria-label="amount"
                className="size-3 rounded-full bg-white outline outline-gray-300 select-none has-focus-visible:outline has-focus-visible:outline-blue-800"
              />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </div>
      <Field.Root className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <Field.Label className="text-xs text-neutral-500">Easing</Field.Label>
        <Select.Root
          onValueChange={(value) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  easing: value as Types.AnimationConfig['easing'],
                }),
            )
          }
          defaultValue={animationConfig.easing}
          items={easingFunctions}
          value={animationConfig.easing}
        >
          <Select.Trigger className="border gap-3 border-solid border-neutral-900 flex items-center justify-center text-neutral-300 px-3 py-1">
            <Select.Value
              className="data-placeholder:opacity-60 text-xs"
              placeholder="Filter"
            />
            <AltArrowDown size={13} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              className="outline-none select-none z-20"
              sideOffset={8}
            >
              <Select.ScrollUpArrow />
              <Select.Popup className="group min-w-(--anchor-width) origin-(--transform-origin) bg-clip-padding bg-black text-neutral-300 shadow-lg shadow-neutral-700 outline outline-neutral-900 data-ending-style:scale-90 data-ending-style:opacity-0 data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-90 data-starting-style:opacity-0 data-side-none:data-starting-style:scale-100 data-side=none:data-starting-style:opacity-100 data-side-none:data-starting-style:transition-none dark:shadow-none dark:outline-neutral-900">
                <Select.Arrow />
                <Select.List>
                  {easingFunctions.map((item) => (
                    <Select.Item
                      className="flex items-center hover:bg-neutral-900/50 cursor-pointer justify-between gap-2 text-xs border-b border-b-solid border-b-neutral-900 p-2"
                      key={item.label}
                      value={item.value}
                    >
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <CheckCircle
                          weight="Bold"
                          className="text-accent-500"
                          size={12}
                        />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
              <Select.ScrollDownArrow />
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Field.Root>
      <div className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900 flex items-center justify-between">
        <p className="text-xs text-neutral-500">Loop Animation</p>
        <Checkbox.Root
          onCheckedChange={(value) =>
            setAnimationConfig(
              (prev) =>
                new Types.AnimationConfig({
                  ...prev,
                  loop: value,
                }),
            )
          }
          defaultChecked={animationConfig.loop}
          className="flex items-center justify-center focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent-800 data-unchecked:border data-unchecked:border-dotted data-unchecked:size-5 data-unchecked:border-neutral-900"
        >
          <Checkbox.Indicator>
            <CheckCircle
              size={20}
              weight="BoldDuotone"
              className="text-accent-200"
            />
          </Checkbox.Indicator>
        </Checkbox.Root>
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
      <AnimatePresence>
        {animationControls.animationQueue.length > 0 && (
          <motion.div
            exit={{ height: 0, opacity: 0, display: 'none' }}
            className="my-1 px-3 py-2 mx-3 text-neutral-500 border border-dotted border-neutral-900 flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center justify-start gap-2">
              <DangerTriangle size={14} weight="Bold" />
              <div>
                Queue: {animationControls.animationQueue.length} animations
                pending
              </div>
            </div>
            <button
              className="text-red-700 underline italic underline-offset-1"
              onClick={animationControls.clearQueue}
            >
              Clear Queue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
