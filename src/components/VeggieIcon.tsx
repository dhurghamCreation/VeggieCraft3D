import React from 'react';
import { VeggieType } from '../types';
import { Carrot } from 'lucide-react';

interface VeggieIconProps {
  type: VeggieType;
  className?: string;
}

export const VeggieIcon: React.FC<VeggieIconProps> = ({ type, className = 'w-5 h-5' }) => {
  switch (type) {
    case 'carrot':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.37-6.37C5.77 11.83 2.27 21.7 2.27 21.7zM15 9l5-5M16.5 3.5l1 3.5 3.5 1" />
        </svg>
      );

    case 'tomato':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="14" r="7.5" />
          <path d="M12 6.5V3.5M10 6.5c-1-1.5-2.5-1.8-3.5-1.5M14 6.5c1-1.5 2.5-1.8 3.5-1.5M12 6.5c-.8.8-2 1.2-3 1M12 6.5c.8.8 2 1.2 3 1" />
        </svg>
      );

    case 'avocado':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 3c-3 3-6 7.5-6 11.5a6 6 0 0 0 12 0C18 10.5 15 6 12 3z" />
          <circle cx="12" cy="14.5" r="2.8" />
        </svg>
      );

    case 'eggplant':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 21c-2.5-2-3-6-1-10 1.5-3 5-6 9-7 0 0-1 3 0 5 1 2 2.5 4 2 7-1 4.5-5 6.5-10 5z" />
          <path d="M15 4c-.5-1-1.5-2-2.5-2M15 4c-1 1-2 1.5-3.5 1.5M15 4c1 1 2 1.2 3.5 1" />
        </svg>
      );

    case 'broccoli':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M10 15v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5" />
          <path d="M7.5 15a4 4 0 0 1-2.5-3.5 4 4 0 0 1 2-3.5 4.5 4.5 0 0 1 7.5-2 4 4 0 0 1 4.5 5.5A4 4 0 0 1 16.5 15h-9z" />
        </svg>
      );

    case 'potato':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M7 7c4-3 10-2 12 2s1 8-2 10-9 2-12-1S3 10 7 7z" />
          <circle cx="8" cy="10" r="0.5" fill="currentColor" />
          <circle cx="13" cy="9" r="0.5" fill="currentColor" />
          <circle cx="10" cy="14" r="0.5" fill="currentColor" />
          <circle cx="15" cy="15" r="0.5" fill="currentColor" />
        </svg>
      );

    case 'sweetcorn':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 18c-2-4-1-11 4-15 5 4 6 11 4 15-1 2-3 3-4 3s-3-1-4-3z" />
          <path d="M10 7h4M9 11h6M10 15h4M12 3v18" />
          <path d="M7 21c-1-3 0-6 2-8M17 21c1-3 0-6-2-8" />
        </svg>
      );

    case 'pumpkin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <ellipse cx="12" cy="14" rx="8" ry="6.5" />
          <ellipse cx="12" cy="14" rx="4" ry="6.5" />
          <path d="M12 7.5V4.5c0-.8.7-1.5 1.5-1.5s1.2.4 1.5 1" />
        </svg>
      );

    case 'chili':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 5c-3-2-7 0-9 3-3 4.5-4 10 2 13 4 2 9 0 9-4 0-4-1-8-2-12z" />
          <path d="M18 5c1-1.5 2-2.5 3-2.5M16 6c-1-1-2-1.5-3.5-1" />
        </svg>
      );

    case 'mushroom':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 13c0-4.4 3.6-8 8-8s8 3.6 8 8H4z" />
          <path d="M9 13v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-6" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="14" cy="8" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'garlic':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 3c-1 3-5 5-5 10a5 5 0 0 0 10 0c0-5-4-7-5-10z" />
          <path d="M12 3v15M9.5 17.5c-1-1-1.5-2.5-1.5-4.5M14.5 17.5c1-1 1.5-2.5 1.5-4.5" />
        </svg>
      );

    case 'onion':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="15" r="6" />
          <path d="M12 9V3M10 9l-2-4M14 9l2-4M9 15c0-1.7 1.3-3 3-3s3 1.3 3 3" />
        </svg>
      );

    default:
      return <Carrot className={className} />;
  }
};
