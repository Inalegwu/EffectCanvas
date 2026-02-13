import {
  Button,
  Checkbox,
  Field,
  Select,
  Slider,
  Toggle,
  ToggleGroup,
} from '@base-ui/react';
import { AltArrowDown, CheckCircle } from '@solar-icons/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import type * as Types from '../canvas/types';
import { useCanvasAPI } from '../contexts/CanvasRendererContext';
import { AnimatedBox } from './atoms';

interface ImageControlsProps {
  images?: Types.ImageSource[];
  onImageSelect?: (image: Types.ImageSource) => void;
  showFilters?: boolean;
  showConfig?: boolean;
}

const filters = [
  {
    label: 'Brightness',
    value: 'brightness',
  },
  {
    label: 'Contrast',
    value: 'contrast',
  },
  {
    label: 'Saturation',
    value: 'saturation',
  },
  {
    label: 'Grayscale',
    value: 'grayscale',
  },
  {
    label: 'Blur',
    value: 'blur',
  },
  {
    label: 'Sepia',
    value: 'sepia',
  },
  {
    label: 'Hue',
    value: 'hue',
  },
];

const scaleModes = [
  {
    label: 'Contain',
    value: 'contain',
  },
  {
    label: 'Cover',
    value: 'cover',
  },
  {
    label: 'Stretch',
    value: 'stretch',
  },
];

export const ImageControls: React.FC<ImageControlsProps> = ({
  images = [],
  onImageSelect,
  showFilters = true,
  showConfig = true,
}) => {
  const {
    renderImage,
    applyFilter,
    clearFilters,
    setBackgroundColor,
    setScaleMode,
    config,
    currentImage,
    takeScreenshot,
    clearCanvas,
  } = useCanvasAPI();

  const [selectedFilter, setSelectedFilter] =
    useState<Types.ImageFilter['type']>('brightness');
  const [filterValue, setFilterValue] = useState(1);

  const handleImageSelect = useCallback(
    async (image: Types.ImageSource) => {
      try {
        await renderImage(image.url, image.width, image.height, image.metadata);
        onImageSelect?.(image);
      } catch (error) {
        console.error('Failed to render image:', error);
      }
    },
    [renderImage, onImageSelect],
  );

  const handleFilterApply = useCallback(async () => {
    try {
      await applyFilter(selectedFilter, filterValue);
    } catch (error) {
      console.error('Failed to apply filter:', error);
    }
  }, [applyFilter, selectedFilter, filterValue]);

  const handleScreenshot = useCallback(async () => {
    try {
      await takeScreenshot?.();
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    }
  }, [takeScreenshot]);

  return (
    <div className="flex flex-col w-full gap-2 overflow-scroll">
      {/* Image controls */}
      <AnimatedBox title="Images" openHeight="12vh" closedHeight="5.5vh">
        <ToggleGroup
          defaultValue={[currentImage?.url || '']}
          className="overflow-x-scroll"
        >
          {images.map((image, index) => (
            <Toggle
              aria-label="ImageToggle"
              type="button"
              key={image.url}
              value={image.url}
              className="px-2 py-1 text-xs mx-1 border border-solid border-neutral-900 focus-visible:bg-none focus-visible:outline-2 focus-visible:-outline-offset-1 active:bg-neutral-900 data-pressed:bg-neutral-900 data-pressed:text-neutral-300"
              onClick={() => handleImageSelect(image)}
            >
              Image {index + 1}
            </Toggle>
          ))}
        </ToggleGroup>
      </AnimatedBox>
      {/* filter controls */}
      {showFilters && (
        <Field.Root
          render={<AnimatedBox title="Filters" closedHeight="5.5vh" />}
          className="my-1 px-3 py-2 mx-3 gap-4 border border-dotted border-neutral-900"
        >
          <div className="flex my-2 items-center gap-4 justify-between w-full">
            <Select.Root
              onValueChange={(value) =>
                setSelectedFilter(value as Types.ImageFilter['type'])
              }
              defaultValue={selectedFilter}
              items={filters}
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
                      {filters.map((item) => (
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
            <Slider.Root
              defaultValue={filterValue}
              onValueChange={(e) => setFilterValue(e)}
              className="w-full"
              min={0}
              max={5}
              step={0.1}
            >
              <Slider.Value className="text-xs text-neutral-500 mb-2" />
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
          <div className="flex items-center justify-start gap-3 mt-3">
            <Button
              className="px-3 py-1 border border-solid border-neutral-900 text-xs"
              onClick={handleFilterApply}
            >
              Apply
            </Button>
            <Button
              className="px-3 py-1 border border-solid border-neutral-900 text-xs"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </Field.Root>
      )}
      {/* config controls */}
      {showConfig && (
        <AnimatedBox
          title="Configuration"
          closedHeight="5.5vh"
          openHeight="23vh"
        >
          {/* <div className="w-full flex items-center justify-between">
            <h3 className="font-medium text-sm text-neutral-400">
              Configuration
            </h3>
            <Button>
              <SquareAltArrowDown
                size={18}
                weight="Bold"
                className="text-neutral-500"
              />
            </Button>
          </div> */}
          <div className="flex items-center justify-between my-2">
            <p className="text-xs text-neutral-400">Background Color:</p>
            <input
              type="color"
              value={config.backgroundColor}
              className="bg-none border border-solid border-neutral-900"
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <Field.Root className="flex items-center justify-between my-2">
            <Field.Label className="text-xs text-neutral-400">
              Scale Mode
            </Field.Label>
            <Select.Root
              onValueChange={(value) =>
                setScaleMode(value as Types.RendererConfig['scaleMode'])
              }
              items={scaleModes}
            >
              <Select.Trigger className="border gap-3 border-solid border-neutral-900 flex items-center justify-center text-neutral-300 px-3 py-1">
                <Select.Value
                  className="data-placeholder:opacity-60 text-xs"
                  placeholder="Scale Mode"
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
                      {scaleModes.map((item) => (
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">Preserve Aspect Ratio:</p>
            <Checkbox.Root
              onCheckedChange={() =>
                console.log('TODO: implement preserve aspect ratio')
              }
              defaultChecked={config.preserveAspectRatio}
              className="flex items-center justify-center focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent-800 bg-neutral-800 data-checked:bg-none data-unchecked:border data-unchecked:border-neutral-900"
            >
              <Checkbox.Indicator>
                <CheckCircle
                  size={20}
                  weight="BoldDuotone"
                  className="text-accent-500"
                />
              </Checkbox.Indicator>
            </Checkbox.Root>
          </div>
        </AnimatedBox>
      )}
      <AnimatedBox title="Actions" closedHeight="5.5vh" openHeight="13vh">
        <div className="flex items-center justify-start gap-2 my-2">
          <Button
            className="px-2 py-1 border border-solid border-neutral-900 text-xs"
            onClick={handleScreenshot}
          >
            📸 Screenshot
          </Button>
          <Button
            className="px-2 py-1 border border-solid border-neutral-900 text-xs"
            onClick={clearCanvas}
          >
            🧹 Clear
          </Button>
        </div>
      </AnimatedBox>
    </div>
  );
};
