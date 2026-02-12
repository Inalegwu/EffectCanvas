import React, { createContext, useContext, useMemo } from 'react';
import * as Types from '../canvas/types';
import { useAnimationControls } from '../hooks/useAnimationControls';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';
import { useImageLoader } from '../hooks/useImageLoader';

interface CanvasRendererContextValue
  extends ReturnType<typeof useCanvasRenderer> {
  imageLoader: ReturnType<typeof useImageLoader>;
  animationControls: ReturnType<typeof useAnimationControls>;
}

const CanvasRendererContext = createContext<CanvasRendererContextValue | null>(
  null,
);

interface CanvasRendererProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<Types.RendererConfig>;
  onReady?: (api: Types.CanvasRendererAPI) => void;
  onError?: (error: Error) => void;
}

export const CanvasRendererProvider: React.FC<CanvasRendererProviderProps> = ({
  children,
  initialConfig,
  onReady,
  onError,
}) => {
  const canvasRenderer = useCanvasRenderer(initialConfig);
  const imageLoader = useImageLoader();
  const animationControls = useAnimationControls(canvasRenderer.api);

  // Notify when API is ready
  React.useEffect(() => {
    if (canvasRenderer.api && onReady) {
      onReady(canvasRenderer.api);
    }
  }, [canvasRenderer.api, onReady]);

  // Handle errors
  React.useEffect(() => {
    if (canvasRenderer.state.error && onError) {
      onError(canvasRenderer.state.error);
    }
  }, [canvasRenderer.state.error, onError]);

  const value = useMemo(
    () => ({
      ...canvasRenderer,
      imageLoader,
      animationControls,
    }),
    [canvasRenderer, imageLoader, animationControls],
  );

  return (
    <CanvasRendererContext.Provider value={value}>
      {children}
    </CanvasRendererContext.Provider>
  );
};

export const useCanvasRendererContext = () => {
  const context = useContext(CanvasRendererContext);
  if (!context) {
    throw new Error(
      'useCanvasRendererContext must be used within CanvasRendererProvider',
    );
  }
  return context;
};

export const useCanvasAPI = () => {
  const { api, state } = useCanvasRendererContext();

  const renderImage = React.useCallback(
    async (
      url: string,
      width: number,
      height: number,
      metadata?: Record<string, unknown>,
    ) => {
      if (!api) throw new Error('API not available');

      const source = new Types.ImageSource({ url, width, height, metadata });
      await api.renderImage(source);
    },
    [api],
  );

  const applyFilter = React.useCallback(
    async (type: Types.ImageFilter['type'], value: number) => {
      if (!api) throw new Error('API not available');

      const filter = new Types.ImageFilter({ type, value });
      await api.applyFilter(filter);
    },
    [api],
  );

  const updateConfig = React.useCallback(
    async (config: Partial<Types.RendererConfig>) => {
      if (!api) throw new Error('API not available');
      await api.updateConfig(config);
    },
    [api],
  );

  const clearFilters = React.useCallback(async () => {
    if (!api) throw new Error('API not available');
    await api.updateConfig({ filters: [] });
  }, [api]);

  const setBackgroundColor = React.useCallback(
    async (color: string) => {
      if (!api) throw new Error('API not available');
      await api.updateConfig({ backgroundColor: color });
    },
    [api],
  );

  const setScaleMode = React.useCallback(
    async (mode: Types.RendererConfig['scaleMode']) => {
      if (!api) throw new Error('API not available');
      await api.updateConfig({ scaleMode: mode });
    },
    [api],
  );

  return {
    api,
    config: state.config,
    currentImage: state.currentImage,
    animationState: state.animationState,
    isReady: state.isReady,
    isLoading: state.isLoading,
    error: state.error,

    // Convenience methods
    renderImage,
    applyFilter,
    updateConfig,
    clearFilters,
    setBackgroundColor,
    setScaleMode,

    // Direct API methods
    takeScreenshot: api?.takeScreenshot,
    clearCanvas: api?.clearCanvas,
    getState: api?.getState,
  };
};
