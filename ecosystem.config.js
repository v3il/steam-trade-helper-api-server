module.exports = {
  apps : [{
    name: 'API',
    script: './bin/www.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'root',
      host : '194.32.79.212',
      ref  : 'origin/master',
      repo : 'https://github.com/v3il/steam-trade-helper-api-server.git',
      path : '/var/www/steam-trade-helper-api-server',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
