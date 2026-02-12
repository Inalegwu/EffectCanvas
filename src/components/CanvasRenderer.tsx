import React from 'react';
import { useCanvasRendererContext } from '../contexts/CanvasRendererContext';

interface CanvasRendererProps {
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  className,
  style,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClick,
}) => {
  const { canvasRef, state } = useCanvasRendererContext();

  return (
    <div className="relative" >
      <canvas
        ref={canvasRef}
        className={`block bg-[${state.config.backgroundColor}] ${className || ''}`}
        style={style}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
      />
      {state.isLoading && (
        <div
        className='absolute top-0 left-0 w-full h-full right-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] text-white'
        >
          Loading...
        </div>
      )}

      {state.error && (
        <div
        className='absolute bg-red-500 text-white rounded-md font-lg top-10 right-10'
        >
          Error: {state.error.message}
        </div>
      )}
    </div>
  );
};
