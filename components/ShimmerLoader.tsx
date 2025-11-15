'use client';

interface ShimmerLoaderProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export default function ShimmerLoader({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = 'md'
}: ShimmerLoaderProps) {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }[rounded];

  return (
    <div
      className={`shimmer ${roundedClass} ${className}`}
      style={{ width, height }}
    />
  );
}

