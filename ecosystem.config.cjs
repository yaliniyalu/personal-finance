const path = require('path')

const buildDir = path.join(__dirname, './api/build')

module.exports = {
  apps: [
    {
      name: 'app-api',
      cwd: buildDir,
      script: 'npm',
      args: 'start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'app-agenda',
      cwd: buildDir,
      script: 'npm',
      args: 'run start:agenda',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

