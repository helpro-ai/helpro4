import { HTMLAttributes, type ReactNode } from 'react';
import './ui.css';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
}

export function Chip({ children, icon, className = '', ...rest }: ChipProps) {
  return (
    <span className={`chip ${className}`.trim()} {...rest}>
      {icon}
      {children}
    </span>
  );
}
