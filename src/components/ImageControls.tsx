import React, { useCallback, useState } from 'react';
import * as Types from '../canvas/types';
import { useCanvasAPI } from '../contexts/CanvasRendererContext';

interface ImageControlsProps {
  images?: Types.ImageSource[];
  onImageSelect?: (image: Types.ImageSource) => void;
  showFilters?: boolean;
  showConfig?: boolean;
}

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
    <div
      className="image-controls"
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>Images</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(image)}
              style={{
                padding: '8px 12px',
                backgroundColor:
                  currentImage?.url === image.url ? '#007acc' : '#ddd',
                color: currentImage?.url === image.url ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Image {index + 1}
            </button>
          ))}
        </div>
      </div>

      {showFilters && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Filters</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <select
              value={selectedFilter}
              onChange={(e) =>
                setSelectedFilter(e.target.value as Types.ImageFilter['type'])
              }
              style={{ padding: '5px', borderRadius: '4px' }}
            >
              <option value="brightness">Brightness</option>
              <option value="contrast">Contrast</option>
              <option value="saturation">Saturation</option>
              <option value="grayscale">Grayscale</option>
              <option value="blur">Blur</option>
              <option value="sepia">Sepia</option>
              <option value="hue">Hue</option>
            </select>

            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={filterValue}
              onChange={(e) => setFilterValue(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />

            <span style={{ minWidth: '40px' }}>{filterValue.toFixed(1)}</span>

            <button
              onClick={handleFilterApply}
              style={{
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>

            <button
              onClick={clearFilters}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showConfig && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Configuration</h3>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Background Color:
            </label>
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Scale Mode:
            </label>
            <select
              value={config.scaleMode}
              onChange={(e) =>
                setScaleMode(
                  e.target.value as Types.RendererConfig['scaleMode'],
                )
              }
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="stretch">Stretch</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Preserve Aspect Ratio:
              <input
                type="checkbox"
                checked={config.preserveAspectRatio}
                onChange={() =>
                  console.log('TODO: Implement preserveAspectRatio toggle')
                }
                style={{ marginLeft: '10px' }}
              />
            </label>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleScreenshot}
          style={{
            padding: '10px 15px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          📸 Screenshot
        </button>

        <button
          onClick={clearCanvas}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1,
          }}
        >
          🧹 Clear
        </button>
      </div>
    </div>
  );
};
