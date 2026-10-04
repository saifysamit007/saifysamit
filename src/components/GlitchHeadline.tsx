import React from 'react';

interface GlitchHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
  className?: string;
  highlightText?: string;
  subtext?: string;
}

export default function GlitchHeadline({
  text,
  as: Component = 'h2',
  className = '',
  highlightText,
  subtext,
}: GlitchHeadlineProps) {
  if (highlightText) {
    const parts = text.split(highlightText);
    return (
      <Component className={`${className} font-display tracking-tight text-white`}>
        {parts[0]}
        <span
          className="glitch-text text-[#FF4655] font-extrabold cursor-pointer transition-colors"
          data-text={highlightText}
        >
          {highlightText}
        </span>
        {parts[1]}
        {subtext && <span className="block mt-1">{subtext}</span>}
      </Component>
    );
  }

  return (
    <Component className={`${className} font-display tracking-tight text-white`}>
      <span
        className="glitch-text inline-block cursor-pointer"
        data-text={text}
      >
        {text}
      </span>
      {subtext && <span className="block mt-1">{subtext}</span>}
    </Component>
  );
}
