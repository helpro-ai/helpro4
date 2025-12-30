import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p className="lead">The page you are looking for does not exist. Return to home.</p>
      <div>
        <Button onClick={() => (window.location.hash = '#/')}>Go home</Button>
      </div>
    </div>
  );
}
