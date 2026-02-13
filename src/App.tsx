import { InfoCircle, TuningSquare } from '@solar-icons/react';
import type React from 'react';
import { useCallback, useState } from 'react';
import * as Types from './canvas/types';
import { AnimationControls } from './components/AnimationControls';
import { CanvasRenderer } from './components/CanvasRenderer';
import { ImageControls } from './components/ImageControls';
import {
  CanvasRendererProvider,
  useCanvasAPI,
} from './contexts/CanvasRendererContext';

// Sample images
const sampleImages: Types.ImageSource[] = [
  new Types.ImageSource({
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    width: 1920,
    height: 1080,
    metadata: { category: 'landscape' },
  }),
  new Types.ImageSource({
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    width: 1920,
    height: 1080,
    metadata: { category: 'nature' },
  }),
  new Types.ImageSource({
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    width: 1920,
    height: 1080,
    metadata: { category: 'mountains' },
  }),
  // new Types.ImageSource({
  //   url: 'https://images.unsplash.com/photo-1770110000509-6c8298224699',
  //   width: 1920,
  //   height: 1080,
  //   metadata: { category: 'nature' },
  // }),
];

// Initial configuration
const initialConfig: Partial<Types.RendererConfig> = {
  width: 1200,
  height: 800,
  backgroundColor: '#1a1a1a',
  scaleMode: 'contain',
  autoPlay: true,
};

const AppContent: React.FC = () => {
  const { isReady, isLoading, error } = useCanvasAPI();
  const [selectedImages, _setSelectedImages] =
    useState<Types.ImageSource[]>(sampleImages);

  const handleImageSelect = useCallback((image: Types.ImageSource) => {
    console.log('Image selected:', image);
  }, []);

  if (!isReady && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Initializing canvas renderer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#dc3545' }}>
        <h2>Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex root items-center w-full h-screen overflow-hidden">
      <div className="absolute z-20 top-2 left-2 text-neutral-900 cursor-pointer backdrop-blur-lg p-1">
        <InfoCircle size={16} weight="Bold" />
      </div>
      <div className="w-[75%] h-full border-r border-r-solid border-r-neutral-900 overflow-hidden">
        <CanvasRenderer className="w-full h-full" />
      </div>
      <div className="w-[25%] h-full flex flex-col items-start justify-start gap-3 overflow-y-scroll">
        <div className="w-full px-3 py-1 flex items-center justify-between">
          <h1 className="text-lg font-medium">Controls</h1>
          <TuningSquare size={22} weight="Bold" className="text-accent-500" />
        </div>
        <ImageControls
          images={selectedImages}
          onImageSelect={handleImageSelect}
          showFilters
          showConfig
        />
        <AnimationControls
          images={selectedImages}
          onAnimationEnd={() => console.log('animation ended')}
          onAnimationStart={() => console.log('Animation started')}
        />
        <div className="w-full flex items-center justify-end gap-2 px-3 py-1 absolute bottom-0 right-0">
          <p className="text-xs text-neutral-800 ">
            Designed and developed by{' '}
            <a
              href="https://ikwueinalegwu.vercel.app"
              target="_blank"
              className="italic underline text-md mx-1 text-accent-300 underline-offset-1 font-stylish"
              rel="noopener"
            >
              Ikwue Inalegwu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const handleReady = useCallback((api: Types.CanvasRendererAPI) => {
    console.log('Canvas API ready:', api);

    // Auto-load first image when ready
    setTimeout(() => {
      api.renderImage(sampleImages[0]);
    }, 100);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Canvas renderer error:', error);
  }, []);

  return (
    <CanvasRendererProvider
      initialConfig={initialConfig}
      onReady={handleReady}
      onError={handleError}
    >
      <AppContent />
    </CanvasRendererProvider>
  );
};

export default App;
