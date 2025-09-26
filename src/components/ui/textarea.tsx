import React from 'react';
import { cn } from '../../utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={cn('textarea', className)} {...props} />;
  }
);

Textarea.displayName = 'Textarea';
