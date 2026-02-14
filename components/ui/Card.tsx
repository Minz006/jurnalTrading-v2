import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`
      bg-white dark:bg-slate-900 
      rounded-xl border border-gray-200 dark:border-slate-800 
      shadow-sm hover:shadow-xl transition-all duration-300 ease-out 
      hover:-translate-y-1
      p-6 ${className}
    `}>
      {title && (
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};