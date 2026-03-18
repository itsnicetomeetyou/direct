// PM2 Ecosystem Configuration
// Manages both the Next.js client and NestJS server processes
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'direct-client',
      cwd: './client',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'direct-server',
      cwd: './server',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
