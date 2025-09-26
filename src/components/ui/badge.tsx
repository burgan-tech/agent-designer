import React from 'react';
import { cn } from '../../utils/cn';

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span className={cn('badge', className)} {...props} />
);
