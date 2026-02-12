import { Effect, Layer } from 'effect';
import * as Runtime from 'effect/Runtime';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as Engine from '../canvas/engine';
import * as Types from '../canvas/types';

export const useCanvasRenderer = (
  initialConfig?: Partial<Types.RendererConfig>,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine.CanvasEngine | null>(null);
  const runtimeRef = useRef<Runtime.Runtime<Engine.CanvasEngine> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const [state, setState] = useState<{
    isReady: boolean;
    isLoading: boolean;
    error: Error | null;
    config: Types.RendererConfig;
    currentImage?: Types.ImageSource;
    animationState: Types.AnimationState;
  }>({
    isReady: true,
    isLoading: false,
    error: null,
    config: new Types.RendererConfig({
      width: 800,
      height: 600,
      backgroundColor: '#000000',
      preserveAspectRatio: true,
      scaleMode: 'contain',
      filters: [],
      autoPlay: true,
      ...initialConfig,
    }),
    animationState: new Types.AnimationState({
      progress: 0,
      isPlaying: false,
      currentFrame: 0,
      totalFrames: 0,
    }),
  });

  useEffect(() => {
    if (!canvasRef.current || runtimeRef.current) return;

    let isMounted = false;

    const init = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const rt = await Layer.toRuntime(Engine.CanvsEngineLayer).pipe(
          Effect.scoped,
          Effect.runPromise,
        );

        runtimeRef.current = rt;

        const engine = await Runtime.runPromise(rt, Engine.CanvasEngine);
        engineRef.current = engine;

        await Runtime.runPromise(rt, engine.initialize(canvasRef.current!));

        if (!isMounted) return;

        setState((prev) => ({
          ...prev,
          isReady: true,
          isLoading: false,
        }));

        pollIntervalRef.current = setInterval(() => {
          if (engineRef.current && runtimeRef.current) {
            Runtime.runPromise(runtimeRef.current, engineRef.current.getState)
              .then((engineState) => {
                if (isMounted) {
                  setState((prev) => ({
                    ...prev,
                    config: engineState.config,
                    currentImage: engineState.currentImage,
                    animationState: engineState.animationState,
                  }));
                }
              })
              .catch((error) => {
                if (isMounted) {
                  setState((prev) => ({
                    ...prev,
                    error:
                      error instanceof Error ? error : new Error(String(error)),
                  }));
                }
              });
          }
        }, 100);
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      if (runtimeRef.current) {
        Runtime.runPromise(runtimeRef.current);
      }
    };
  });

  const api = useMemo((): Types.CanvasRendererAPI | null => {
    if (!runtimeRef.current || !engineRef.current) return null;

    const runtime = runtimeRef.current;
    const engine = engineRef.current;

    return {
      renderImage: async (source) => {
        await Runtime.runPromise(runtime, engine.renderImage(source));
      },
      animateTransition: async (from, to, animation) => {
        await Runtime.runPromise(
          runtime,
          engine.animateTransition(from, to, animation),
        );
      },
      applyFilter: async (filter) => {
        await Runtime.runPromise(runtime, engine.applyFilter(filter));
      },
      updateConfig: async (config) => {
        await Runtime.runPromise(runtime, engine.updateConfig(config));
      },
      takeScreenshot: async (format, quality) => {
        const dataUrl = await Runtime.runPromise(
          runtime,
          engine.takeScreenshot(format, quality),
        );

        const link = document.createElement('a');
        link.download = `screenshot-${Date.now()}.${format || 'png'}`;
        link.href = dataUrl;
        link.click();
        return dataUrl;
      },
      clearCanvas: async () => {
        await Runtime.runPromise(runtime, engine.clearCanvas());
      },
      playAnimation: async () => {
        throw new Error('Unimplemented');
      },
      pauseAnimation: async () => {
        throw new Error('Unimplemented');
      },
      getState: async () => {
        const engineState = await Runtime.runPromise(runtime, engine.getState);
        return {
          currentImage: engineState.currentImage,
          config: engineState.config,
          animationState: engineState.animationState,
        };
      },
    };
  }, [runtimeRef.current, engineRef.current]);

  useEffect(() => {
    if (canvasRef.current && state.isReady) {
      canvasRef.current.width = state.config.width;
      canvasRef.current.height = state.config.height;
    }
  }, [state.config.width, state.config.height, state.isReady]);

  return {
    canvasRef,
    api,
    state,
    setState,
  };
};
