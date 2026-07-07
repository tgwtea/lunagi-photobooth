import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'font-sans font-medium text-sm px-6 py-3 rounded-full transition-all duration-200 focus:outline-none flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-[#1A1A1A] text-white hover:opacity-90 active:scale-[0.98]',
    secondary: 'bg-transparent text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#FDFBFA] active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
