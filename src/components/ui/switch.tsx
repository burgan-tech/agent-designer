import React from 'react';
import { cn } from '../../utils/cn';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn('switch', className)}
        data-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span className="switch-thumb" />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
