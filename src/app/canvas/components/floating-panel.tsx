'use client;';

import { cn } from '@/lib/utils';
import type { ComponentProps, PropsWithChildren } from 'react';

export type FloatingPanelProps = PropsWithChildren & ComponentProps<'div'>;

function FloatingPanel({ children, className, ...rest }: FloatingPanelProps) {
  return (
    <div
      className={cn('rounded bg-background overflow-hidden', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export default FloatingPanel;
