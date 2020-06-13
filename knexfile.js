const config = require('./src/config');

const dbConfig = {
    client: 'mysql',
    version: '5.7',

    connection: {
        host: config.DB_HOST,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
        database: config.DB_NAME,
    },

    pool: {
        min: 2,
        max: 10,
    },

    migrations: {
        tableName: 'migrations',
    },
};

module.exports = {
    development: dbConfig,
    production: dbConfig,
};