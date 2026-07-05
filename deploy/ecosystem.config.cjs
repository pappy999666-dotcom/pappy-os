module.exports = {
  apps: [
    {
      name: 'pappy-os',
      script: 'dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PAPPY_DATA_DIR: '/var/lib/pappy-os',
      },
      max_memory_restart: '512M',
      time: true,
    },
  ],
};
