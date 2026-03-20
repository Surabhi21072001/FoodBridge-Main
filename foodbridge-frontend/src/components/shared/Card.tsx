import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const baseStyles = 'bg-white rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md';
  const combinedClassName = `${baseStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', ...props }) => {
  const baseStyles = 'px-6 py-4 border-b border-gray-200';
  const combinedClassName = `${baseStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '', ...props }) => {
  const baseStyles = 'px-6 py-4';
  const combinedClassName = `${baseStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', ...props }) => {
  const baseStyles = 'px-6 py-4 border-t border-gray-200 bg-gray-50';
  const combinedClassName = `${baseStyles} ${className}`;

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export default Card;
export { CardHeader, CardBody, CardFooter };
