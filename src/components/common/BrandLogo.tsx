'use client';

import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const CANDIDATE_LOGOS = ['/logo.png', '/logo.svg', '/logo.webp', '/logo.jpg', '/logo.jpeg'];

interface BrandLogoGraphicProps {
  className?: string;
  size?: number;
}

export const BrandLogoGraphic: React.FC<BrandLogoGraphicProps> = ({ className, size = 24 }) => {
  const [candidateIndex, setCandidateIndex] = useState(0);

  if (candidateIndex < CANDIDATE_LOGOS.length) {
    return (
      <img
        src={CANDIDATE_LOGOS[candidateIndex]}
        alt="FleetFlow Logo"
        className={cn('w-full h-full object-contain', className)}
        onError={() => setCandidateIndex((prev) => prev + 1)}
      />
    );
  }

  return <Compass className={cn('text-white stroke-[2.5]', className)} size={size} />;
};

interface BrandLogoProps {
  variant?: 'header' | 'admin' | 'driver' | 'footer' | 'compact';
  showText?: boolean;
  className?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  showText = true,
  className,
  subtext,
  size = 'md',
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const hasValidImage = candidateIndex < CANDIDATE_LOGOS.length;

  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none group', className)}>
      <div
        className={cn(
          'rounded-2xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0 p-1',
          containerSizes[size]
        )}
      >
        {hasValidImage ? (
          <img
            src={CANDIDATE_LOGOS[candidateIndex]}
            alt="LA Travels Logo"
            className="w-full h-full object-contain"
            onError={() => setCandidateIndex((prev) => prev + 1)}
          />
        ) : (
          <Compass
            className="text-blue-600 stroke-[2.5] group-hover:rotate-45 transition-transform duration-300"
            size={iconSizes[size]}
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-extrabold tracking-tight text-slate-900 dark:text-white',
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              )}
            >
              LA <span className="text-blue-600 dark:text-blue-400 font-black">Travels</span>
            </span>
            {variant === 'admin' && (
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
                ADMIN
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
            {subtext || 'Better journeys begin here'}
          </p>
        </div>
      )}
    </div>
  );
};
