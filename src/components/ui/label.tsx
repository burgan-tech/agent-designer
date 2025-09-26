import React from 'react';
import { cn } from '../../utils/cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('label', className)} {...props} />
));

Label.displayName = 'Label';
