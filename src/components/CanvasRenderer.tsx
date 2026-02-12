import type React from 'react';
import { useCanvasRendererContext } from '../contexts/CanvasRendererContext';

interface CanvasRendererProps {
  className?: string;
  onMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onClick,
  className,
}) => {
  const { canvasRef, state } = useCanvasRendererContext();

  return (
    <div className="w-full h-full">
      <canvas
        className={className}
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={onClick}
      />
      {state.isLoading && <div>Loading...</div>}

      {state.error && <div>Error: {state.error.message}</div>}
    </div>
  );
};
