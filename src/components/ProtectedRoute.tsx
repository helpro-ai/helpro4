export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = typeof window !== 'undefined' ? localStorage.getItem('helpro_user') : null;
  if (!user) {
    return children;
  }
  return children;
}
