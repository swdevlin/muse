"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => await pool.connect(),
  pool: pool
}
