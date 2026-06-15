/** PM2 config — run from repo root: pm2 start cms/ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'portfolio-cms',
      cwd: __dirname,
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
