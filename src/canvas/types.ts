import { Data, Schema } from 'effect';
import type React from 'react';

export class ImageSource extends Data.TaggedClass('ImageSource')<{
  url: string;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
}> {}

export class AnimationState extends Data.TaggedClass('AnimationState')<{
  progress: number;
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
}> {}

export class RendererConfig extends Data.TaggedClass('RendererConfig')<{
  width: number;
  height: number;
  backgroundColor: string;
  preserveAspectRatio: boolean;
  scaleMode: 'contain' | 'cover' | 'stretch';
  filters: ImageFilter[];
  autoPlay: boolean;
}> {}

export class ImageFilter extends Data.TaggedClass('ImageFilter')<{
  type:
    | 'brightness'
    | 'contrast'
    | 'saturation'
    | 'grayscale'
    | 'blur'
    | 'sepia'
    | 'hue';
  value: number;
}> {}

export class AnimationConfig extends Data.TaggedClass('AnimationConfig')<{
  type: 'fade' | 'slide' | 'zoom' | 'crossfade' | 'dissolve' | 'kenBurns';
  duration: number;
  easing: EasingFunction;
  direction: 'in' | 'out' | 'both';
  loop: boolean;
}> {}

export type EasingFunction =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'spring';

export interface CanvasRendererProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onReady?: (api: CanvasRendererAPI) => void;
  onError?: (error: Error) => void;
  config: Partial<RendererConfig>;
}

export interface CanvasRendererAPI {
  renderImage: (source: ImageSource) => Promise<void>;
  animateTransition: (
    from: ImageSource,
    to: ImageSource,
    animation: AnimationConfig,
  ) => Promise<void>;
  applyFilter: (filter: ImageFilter) => Promise<void>;
  updateConfig: (config: Partial<RendererConfig>) => Promise<void>;
  takeScreenshot: (
    format?: 'png' | 'jpeg',
    quality?: number,
  ) => Promise<string>;
  clearCanvas: () => Promise<void>;
  playAnimation: () => Promise<void>;
  pauseAnimation: () => Promise<void>;
  getState: () => Promise<{
    currentImage?: ImageSource;
    config: RendererConfig;
    animationState: AnimationState;
  }>;
}

export class CanvasError extends Data.TaggedClass('CanvasError')<{
  message: string;
  cause?: unknown;
}> {}

export class AnimationError extends Data.TaggedClass('AnimationError')<{
  message: string;
}> {}

export interface CanvasRendererContextValue {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  api: CanvasRendererAPI | null;
  config: RendererConfig;
  currentImage?: ImageSource;
  animationStation: AnimationState;
}

export const ImageSourceSchema = Schema.Struct({
  url: Schema.String.pipe(Schema.pattern(new RegExp('^http?://|^data:'))),
  width: Schema.Number.pipe(Schema.positive()),
  height: Schema.Number.pipe(Schema.positive()),
  metadata: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }).pipe(Schema.optional),
});

export const RendererConfigSchema = Schema.Struct({
  width: Schema.Number.pipe(Schema.between(100, 5000)),
  height: Schema.Number.pipe(Schema.between(100, 5000)),
  backgroundColor: Schema.String.pipe(
    Schema.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgba?\(/),
  ),
  preserveAspectRatio: Schema.Boolean,
  scaleMode: Schema.Literal('contain', 'cover', 'stretch'),
  filters: Schema.Array(
    Schema.Struct({
      type: Schema.Literal(
        'brightness',
        'contrast',
        'saturation',
        'grayscale',
        'blur',
        'sepia',
        'hue',
      ),
      value: Schema.Number.pipe(Schema.between(0, 5)),
    }),
  ),
  autoPlay: Schema.Boolean,
});
