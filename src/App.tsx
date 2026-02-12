import React, { useCallback, useState } from 'react';
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

  console.log({ isReady, isLoading });

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
    <div
      className="app"
      style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}
    >
      <header style={{ marginBottom: '30px' }}>
        <h1>🎨 Effect-TS Canvas Renderer (React)</h1>
        <p>Type-safe canvas rendering with animation and configuration</p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '30px',
          marginBottom: '30px',
        }}
      >
        <div>
          <CanvasRenderer
            className="main-canvas"
            style={{
              width: '100%',
              height: '600px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              console.log(`Canvas clicked at: ${x}, ${y}`);
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ImageControls
            images={selectedImages}
            onImageSelect={handleImageSelect}
            showFilters
            showConfig
          />

          <AnimationControls
            images={selectedImages.slice(0, 2)}
            onAnimationStart={() => console.log('Animation started')}
            onAnimationEnd={() => console.log('Animation ended')}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        <div
          className='p-3.75 bg-neutral-100 rounded-md'
        >
          <h4>Ready</h4>
          <div>{isReady ? '✅' : '❌'}</div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h4>Loading</h4>
          <div>{isLoading ? '⏳' : '✅'}</div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <h4>Error</h4>
          <div>{error ? '❌' : '✅'}</div>
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
