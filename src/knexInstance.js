const knex = require('knex');
const config = require('./config');
const knexConfig = require('../knexfile');

module.exports = knex(knexConfig[config.NODE_ENV]);