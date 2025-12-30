import { InputHTMLAttributes, forwardRef } from 'react';
import './ui.css';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function InputComponent(
  { className = '', ...rest },
  ref,
) {
  return <input ref={ref} className={`input ${className}`.trim()} {...rest} />;
});
