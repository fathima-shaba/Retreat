import React from 'react';

const Logo = ({ size = 24, color = 'currentColor', className = '', style = {} }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      fill={color} 
      className={className} 
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* Top Horizontal Bar */}
      <rect x="16" y="15" width="68" height="12" />
      {/* Left Vertical Stem */}
      <rect x="16" y="27" width="12" height="58" />
      {/* Middle Horizontal Bar */}
      <rect x="28" y="43" width="56" height="12" />
      {/* Center Vertical Stem */}
      <rect x="50" y="55" width="12" height="30" />
    </svg>
  );
};

export default Logo;
