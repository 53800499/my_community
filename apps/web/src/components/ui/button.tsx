import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading = false, children, className = '', disabled, ...props }, ref) => {
    const variantClass =
      variant === 'secondary'
        ? 'mc-button-secondary'
        : variant === 'accent'
          ? 'mc-button-accent'
          : 'mc-button-primary';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${variantClass} ${className}`}
        {...props}
      >
        {isLoading ? <span>Chargement...</span> : children}
      </button>
    );
  },
);

Button.displayName = 'Button';
