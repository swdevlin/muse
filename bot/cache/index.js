"use strict"

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient({ host: process.env.REDIS_HOST });

const redis_key = process.env.REDIS_KEY;

const get = async (key) => {
  const rkey = `${redis_key}:${key}`;
  try {
    return await client.get(rkey);
  } catch(err) {
    console.log('Error ' + err);
  }
};

const set = async (key, value) => {
  const rkey = `${redis_key}:${key}`;
  await client.set(rkey, value);
};

module.exports = {
  get: get,
  set: set,
  client: client,
}
