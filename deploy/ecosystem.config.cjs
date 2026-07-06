const pfpPath = process.env.PFP_BOT_PATH || '/opt/pappy/pappy-pfp';
const whatsappPath = process.env.WHATSAPP_BOT_PATH || '/opt/pappy/verbose-fishstick/artifacts/api-server';

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
        PFP_BOT_API_URL: 'http://127.0.0.1:4101',
        WHATSAPP_BOT_API_URL: 'http://127.0.0.1:4102',
      },
      max_memory_restart: '512M',
      time: true,
    },
    {
      name: 'pappy-pfp',
      cwd: pfpPath,
      script: 'src/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4101,
      },
      max_memory_restart: '512M',
      time: true,
    },
    {
      name: 'verbose-fishstick',
      cwd: whatsappPath,
      script: 'index.js',
      node_args: '--expose-gc',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4102,
      },
      max_memory_restart: '768M',
      time: true,
    },
  ],
};
