'use client';

import { useRef } from 'react';

interface ColumnResizerProps {
  onResize: (newWidth: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export default function ColumnResizer({ onResize, minWidth = 80, maxWidth }: ColumnResizerProps) {
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    
    // Get the current width of the column being resized
    const th = (e.currentTarget as HTMLElement).parentElement as HTMLTableCellElement;
    if (th) {
      startWidthRef.current = th.offsetWidth;
    }

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;

      // Apply min/max constraints
      const constrainedWidth = Math.max(
        minWidth,
        maxWidth ? Math.min(maxWidth, newWidth) : newWidth
      );

      // Pass the absolute new width, not the delta
      onResize(constrainedWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors group"
      style={{ zIndex: 10 }}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize column"
    >
      <div className="absolute top-0 right-0 w-0.5 h-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors" />
    </div>
  );
}
