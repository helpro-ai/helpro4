import { ButtonHTMLAttributes, forwardRef } from 'react';
import './ui.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
        disabled={loading || rest.disabled}
        {...rest}
      >
        {loading ? '...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
