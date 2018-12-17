const ENV = process.env.NODE_ENV || 'development';
const knex = require('knex');
const dbConfig = require('../knexfile.js')[ENV];


const connection = knex(dbConfig);
module.exports = connection;
