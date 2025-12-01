module.exports = {
  apps: [
    {
      name: 'film-rating',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: 'C:/Users/ferta/Documents/GitHub/Local-Film-rating',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
