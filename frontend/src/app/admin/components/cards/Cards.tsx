import React from "react";

// Card utama
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition-shadow hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Header card 
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`flex flex-row items-center justify-between mb-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Content card
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
  return (
    <div className={`text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Title card
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: React.FC<CardTitleProps> = ({ children, className, ...props }) => {
  return (
    <h3 className={`text-sm font-semibold text-gray-700 ${className}`} {...props}>
      {children}
    </h3>
  );
};

// Badge 
interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardBadge: React.FC<CardBadgeProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`p-3 rounded-lg bg-gray-100 inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
