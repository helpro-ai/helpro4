import { spawn } from 'child_process';

console.log('🚀 Starting Helpro in full-stack mode...\n');

const api = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
});

const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  api.kill();
  vite.kill();
  process.exit();
});
