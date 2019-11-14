const Redis = require('../src');

const redis = new Redis({
  // host: '127.0.0.1',
  // password: '',
  // port: 6379,
  // db: 0,
});

module.exports = redis;
