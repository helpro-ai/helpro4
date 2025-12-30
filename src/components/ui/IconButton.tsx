import { ButtonHTMLAttributes } from 'react';
import './ui.css';

export function IconButton({ children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`icon-btn ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
