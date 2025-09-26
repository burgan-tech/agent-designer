import { cn } from '../../utils/cn';
import React from 'react';

type ButtonVariant = 'default' | 'primary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  default: 'shad-button',
  primary: 'shad-button primary',
  ghost: 'shad-button ghost',
  destructive: 'shad-button destructive'
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'text-xs py-1 px-2',
  md: '',
  lg: 'text-base py-3 px-5'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantClass[variant], sizeClass[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
