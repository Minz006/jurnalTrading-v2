import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-surface rounded-xl border border-slate-700 shadow-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};