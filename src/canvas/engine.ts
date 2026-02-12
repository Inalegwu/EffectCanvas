import { Context, Duration, Effect, Fiber, Layer, Queue, Ref } from 'effect';
import * as Types from './types';

export interface CanvasEngine {
  readonly initialize: (
    canvas: HTMLCanvasElement,
  ) => Effect.Effect<void, Types.CanvasError>;
  readonly renderImage: (
    source: Types.ImageSource,
  ) => Effect.Effect<void, Types.CanvasError>;
  readonly animateTransition: (
    from: Types.ImageSource,
    to: Types.ImageSource,
    animation: Types.AnimationConfig,
  ) => Effect.Effect<void, Types.CanvasError | Types.AnimationError>;
  readonly applyFilter: (
    filter: Types.ImageFilter,
  ) => Effect.Effect<void, Types.CanvasError>;
  readonly updateConfig: (
    config: Partial<Types.RendererConfig>,
  ) => Effect.Effect<void, Types.CanvasError>;
  readonly takeScreenshot: (
    format?: 'png' | 'jpeg',
    quality?: number,
  ) => Effect.Effect<string, Types.CanvasError>;
  readonly clearCanvas: () => Effect.Effect<void, Types.CanvasError>;
  readonly getState: Effect.Effect<EngineState>;
  readonly dispose: Effect.Effect<void>;
}

export interface EngineState {
  currentImage?: Types.ImageSource;
  config: Types.RendererConfig;
  animationState: Types.AnimationState;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
}

export const CanvasEngine = Context.GenericTag<CanvasEngine>(
  '@effectvas/CanvasEngine',
);

interface InternalState {
  currentAnimationFiber?: Fiber.RuntimeFiber<void>;
  imageCache: Map<string, HTMLImageElement>;
  pendingOperations: Queue.Queue<Effect.Effect<void>>;
}

const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  spring: (t: number) => 1 - Math.cos(t * Math.PI * 4) * Math.exp(-t * 6),
};

const makeCanvasEngine = Effect.gen(function* (_) {
  const stateRef = yield* _(
    Ref.make<EngineState>({
      currentImage: undefined,
      config: new Types.RendererConfig({
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        preserveAspectRatio: true,
        scaleMode: 'contain',
        filters: [],
        autoPlay: true,
      }),
      animationState: new Types.AnimationState({
        progress: 0,
        isPlaying: false,
        currentFrame: 0,
        totalFrames: 0,
      }),
      canvas: null,
      context: null,
    }),
  );

  const internalRef = yield* _(
    Ref.make<InternalState>({
      imageCache: new Map(),
      pendingOperations: yield* _(Queue.unbounded<Effect.Effect<void>>()),
    }),
  );

  const loadImage = (
    source: Types.ImageSource,
  ): Effect.Effect<HTMLImageElement, Types.CanvasError> =>
    Effect.gen(function* () {
      const internal = yield* _(Ref.get(internalRef));

      const cached = internal.imageCache.get(source.url);

      if (cached) return cached;

      const image = yield* _(
        Effect.tryPromise({
          try: () =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.crossOrigin = 'anonymous';
              image.onload = () => resolve(image);
              image.onerror = reject;
              image.src = source.url;
            }),
          catch: (error) =>
            new Types.CanvasError({
              message: `Failed to load image ${source.url}`,
              cause: error,
            }),
        }),
      );

      yield* _(
        Ref.update(internalRef, (state) => ({
          ...state,
          imageCache: new Map(state.imageCache).set(source.url, image),
        })),
      );

      return image;
    });

  const calculateDimensions = (
    imgWidth: number,
    imgHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    scaleMode: Types.RendererConfig['scaleMode'],
  ) => {
    switch (scaleMode) {
      case 'stretch': {
        return {
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
        };
      }
      case 'contain': {
        const scale = Math.min(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        return {
          x: (canvasWidth - width) / 2,
          y: (canvasHeight - height) / 2,
          width,
          height,
        };
      }
      case 'cover': {
        const scale = Math.max(
          canvasWidth / imgWidth,
          canvasHeight / imgHeight,
        );
        const width = imgWidth * scale;
        const height = imgHeight * scale;
        return {
          x: (canvasWidth - width) / 2,
          y: (canvasHeight - height) / 2,
          width,
          height,
        };
      }
    }
  };

  const applyFilters = (
    context: CanvasRenderingContext2D,
    filters: Types.ImageFilter[],
  ) => {
    const filterString = filters
      .map((filter) => {
        switch (filter.type) {
          case 'brightness':
            return `brightness(${filter.value})`;
          case 'contrast':
            return `contrast(${filter.value})`;
          case 'saturation':
            return `saturate(${filter.value})`;
          case 'grayscale':
            return `grayscale(${filter.value})`;
          case 'blur':
            return `blur(${filter.value}px)`;
          case 'sepia':
            return `sepia(${filter.value})`;
          case 'hue':
            return `hue-rotate(${filter.value}deg)`;
          default:
            return '';
        }
      })
      .join(' ');

    context.filter = filterString || 'none';
  };

  const setupCanvas = (
    context: CanvasRenderingContext2D,
    config: Types.RendererConfig,
  ) => {
    const { width, height, backgroundColor } = config;
    context.clearRect(0, 0, width, height);
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  };

  const renderImage: CanvasEngine['renderImage'] = (source) =>
    Effect.gen(function* () {
      const state = yield* _(Ref.get(stateRef));

      if (!state.context || !state.canvas) {
        return yield* Effect.fail(
          new Types.CanvasError({
            message: 'Canvas not initialized',
          }),
        );
      }

      const img = yield* _(loadImage(source));

      // Update state
      yield* _(
        Ref.update(stateRef, (s) => ({
          ...s,
          currentImage: source,
        })),
      );

      // Render image
      const { context, canvas, config } = state;
      setupCanvas(context, config);

      applyFilters(context, config.filters);

      const { x, y, width, height } = calculateDimensions(
        img.width,
        img.height,
        canvas.width,
        canvas.height,
        config.scaleMode,
      );

      context.drawImage(img, x, y, width, height);

      yield* _(Effect.logInfo(`Rendered image: ${source.url}`));
    });

  const getState = Ref.get(stateRef);

  return CanvasEngine.of({
    initialize: (canvas) =>
      Effect.gen(function* () {
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return yield* Effect.fail(
            new Types.CanvasError({
              message: 'Failed to get 2D context',
            }),
          );
        }

        yield* Ref.update(stateRef, (state) => ({
          ...state,
          canvas,
          context: ctx,
        }));

        const config = (yield* Ref.get(stateRef)).config;

        setupCanvas(ctx, config);
        yield* Effect.logInfo('Canvas Engine Intialized');
      }),
    renderImage,
    animateTransition: (from, to, animation) =>
      Effect.gen(function* () {
        const state = yield* getState;

        if (!state.context || !state.canvas) {
          yield* Effect.fail(
            new Types.CanvasError({
              message: 'Canvas not initialized',
            }),
          );
        }

        const [fromImg, toImg] = yield* Effect.all([
          loadImage(from),
          loadImage(to),
        ]);

        yield* Ref.update(stateRef, (s) => ({
          ...s,
          animationState: new Types.AnimationState({
            progress: 0,
            isPlaying: true,
            currentFrame: 0,
            totalFrames: Math.floor(animation.duration / 16),
          }),
        }));

        const animationEffect = Effect.gen(function* () {
          const startTime = Date.now();
          const duration = animation.duration;

          yield* Effect.iterate(0, {
            while: (progress) => progress < 1,
            body: (progress) =>
              Effect.gen(function* () {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;

                progress = Math.min(elapsed / duration, 1);

                yield* Ref.update(stateRef, (s) => ({
                  ...s,
                  animationState: new Types.AnimationState({
                    ...s.animationState,
                    progress,
                    currentFrame: Math.floor(
                      progress * s.animationState.totalFrames,
                    ),
                  }),
                }));

                const s = yield* getState;

                const { config, context, canvas } = s;

                setupCanvas(context!, config);
                applyFilters(context!, config.filters);

                const easedProgress =
                  easingFunctions[animation.easing](progress);

                switch (animation.type) {
                  case 'fade': {
                    context!.globalAlpha = 1 - easedProgress;
                    context!.drawImage(
                      fromImg,
                      0,
                      0,
                      canvas!.width,
                      canvas!.height,
                    );
                    context!.globalAlpha = easedProgress;
                    context!.drawImage(
                      toImg,
                      0,
                      0,
                      canvas!.width,
                      canvas!.height,
                    );
                    break;
                  }
                  case 'slide': {
                    const slideX = canvas!.width * easedProgress;
                    context!.drawImage(
                      fromImg,
                      -slideX,
                      0,
                      canvas!.width,
                      canvas!.height,
                    );
                    context!.drawImage(
                      toImg,
                      canvas!.width - slideX,
                      0,
                      canvas!.width,
                      canvas!.height,
                    );
                    break;
                  }
                  case 'zoom': {
                    const scale = 1 + easedProgress * 0.5;
                    const scaledWidth = canvas!.width * scale;
                    const scaledHeight = canvas!.height * scale;
                    const offsetX = (canvas!.width - scaledWidth) / 2;
                    const offsetY = (canvas!.height - scaledHeight) / 2;

                    context!.drawImage(
                      fromImg,
                      offsetX,
                      offsetY,
                      scaledWidth,
                      scaledHeight,
                    );
                    break;
                  }
                  case 'crossfade':
                  case 'dissolve':
                  case 'kenBurns':
                }

                context!.globalAlpha = 1;

                yield* Effect.sleep(Duration.millis(16));

                return progress;
              }),
          });

          yield* Ref.update(stateRef, (s) => ({
            ...s,
            animationState: new Types.AnimationState({
              ...s.animationState,
              progress: 1,
              isPlaying: false,
            }),
            currentImage: to,
          }));
        });

        const animationFiber = yield* Effect.fork(animationEffect);

        yield* Ref.update(internalRef, (s) => ({
          ...s,
          currentAnimationFiber: animationFiber,
        }));

        if (!animation.loop) {
          yield* Fiber.join(animationFiber);
        }
      }),
    applyFilter: (filter) =>
      Effect.gen(function* () {
        yield* _(
          Ref.update(stateRef, (s) => ({
            ...s,
            config: new Types.RendererConfig({
              ...s.config,
              filters: [...s.config.filters, filter],
            }),
          })),
        );

        // Re-render current image
        const state = yield* _(Ref.get(stateRef));
        if (state.currentImage) {
          yield* _(renderImage(state.currentImage));
        }
      }),
    updateConfig: (config) =>
      Effect.gen(function* () {
        yield* Ref.update(stateRef, (s) => ({
          ...s,
          config: new Types.RendererConfig({
            ...s.config,
            ...config,
          }),
        }));

        const state = yield* getState;

        if (state.currentImage && state.canvas && state.context) {
          setupCanvas(state.context, state.config);
          yield* renderImage(state.currentImage);
        }
      }),
    clearCanvas: () =>
      Effect.gen(function* () {
        const state = yield* getState;

        if (!state.context || !state.canvas) {
          return yield* Effect.fail(
            new Types.CanvasError({
              message: 'Canvas not initialized',
            }),
          );
        }

        setupCanvas(state.context, state.config);

        yield* Ref.update(stateRef, (s) => ({ ...s, currentImage: undefined }));
      }),
    takeScreenshot: (format, quality) =>
      Effect.gen(function* () {
        const state = yield* _(Ref.get(stateRef));

        if (!state.canvas) {
          return yield* Effect.fail(
            new Types.CanvasError({
              message: 'Canvas not initialized',
            }),
          );
        }

        const dataUrl = state.canvas.toDataURL(`image/${format}`, quality);

        yield* Effect.logInfo(
          `Screenshot taken: ${dataUrl.substring(0, 50)}...`,
        );
        return dataUrl;
      }),
    getState,
    dispose: Effect.gen(function* (_) {
      const internal = yield* _(Ref.get(internalRef));

      if (internal.currentAnimationFiber) {
        yield* Fiber.interrupt(internal.currentAnimationFiber);
      }

      yield* Ref.update(internalRef, (s) => ({
        ...s,
        imageCache: new Map(),
      }));

      yield* _(Effect.logInfo('Canvas engine disposed'));
    }),
  });
});

export const CanvsEngineLayer = Layer.effect(CanvasEngine, makeCanvasEngine);
