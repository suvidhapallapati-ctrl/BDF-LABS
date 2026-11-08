const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

const tester = spawn('node', ['test-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

tester.on('close', (code) => {
  server.kill();
  process.exit(code);
});
