const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.SERVER_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    PORT,
    NODE_ENV,

    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    DB_NAME: process.env.DB_NAME || 'steam_trade_helper',

    PASSWORD_SECRET: process.env.PASSWORD_SECRET || 'Some secret phrase',

    MAX_STAT_PERIOD: 14,
    AVG_PRICE_SELECTION_LENGTH: 20,
    UPDATE_INFO_DELAY: 5 * 1000,
};
