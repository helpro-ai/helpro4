import { ReactNode } from 'react';
import './ui.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="drawer" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="drawer-panel animate-slide-up" onClick={e => e.stopPropagation()}>
        {title && <h3 style={{ marginBottom: '1rem' }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
