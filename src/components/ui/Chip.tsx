import { ButtonHTMLAttributes, type ReactNode } from 'react';
import './ui.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export function Chip({ children, icon, className = '', ...rest }: ChipProps) {
  return (
    <button type="button" className={`chip ${className}`.trim()} {...rest}>
      {icon}
      {children}
    </button>
  );
}
