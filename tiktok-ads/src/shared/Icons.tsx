import React from 'react';

type P = {readonly color?: string; readonly size?: number};

export const Check: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const Cross: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const Flame: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2c1 3.5 5 6 5 11a5 5 0 01-10 0c0-2.2 1-3.8 2.3-5 .2 1.8 1 3 2.2 3.5C11 9 11 5.5 12 2z" />
  </svg>
);

export const Drop: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2.5C9 7 5.5 10.5 5.5 14.5a6.5 6.5 0 0013 0C18.5 10.5 15 7 12 2.5z" />
  </svg>
);

export const Bolt: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M13.5 2L4 13.5h6.5L9.5 22 20 9.5h-6.6L13.5 2z" />
  </svg>
);

export const Leaf: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20 3C10 3 4 8 4 15c0 2 .6 3.7 1.5 5 1-4 4-8 9-10-4 3-6.5 6.5-7.3 10.5C8.5 21.5 10 22 12 22c6 0 9-6 8-19z" />
  </svg>
);

export const Star: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
  </svg>
);

export const Clock: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.8} strokeLinecap="round">
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7v5l3.5 2.5" />
  </svg>
);

export const Hand: React.FC<P> = ({color = '#fff', size = 44}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M9 2.5a1.5 1.5 0 013 0V10l.1-1.5a1.5 1.5 0 013 .2V11a1.5 1.5 0 013 .3v1a1.5 1.5 0 013 .4V16c0 3.3-2.7 6-6 6h-1.5c-2 0-3.7-1-4.8-2.6L5 14.5a1.6 1.6 0 012.6-1.8L9 14.5V2.5z" />
  </svg>
);
