'use client';

import Image from 'next/image';
import { useThemeSafe } from '@/lib/context/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 'md', showText = true, className = '', priority = false }: LogoProps) {
  const { theme } = useThemeSafe();
  
  const sizeMap = {
    sm: { width: 32, height: 32, text: 'text-base' },
    md: { width: 40, height: 40, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-3xl' }
  };

  const dimensions = sizeMap[size];
  const textColor = 'text-gray-600';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Image Logo */}
      <div className="flex items-center justify-center shadow-lg hover:shadow-blue-500/50 transition-shadow rounded-lg overflow-hidden">
        <Image
          src="/logo.png"
          alt="BizLead Logo"
          width={dimensions.width}
          height={dimensions.height}
          sizes={`${dimensions.width}px`}
          priority={priority}
        />
      </div>

      {/* Text Logo */}
      {showText && (
        <span className={`font-bold ${dimensions.text} leading-tight tracking-wide ${textColor}`}>
          BizLead
        </span>
      )}
    </div>
  );
}
