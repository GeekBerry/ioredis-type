const IORedis = require('ioredis');
const DirectoryType = require('./dir');

class Redis extends IORedis {
  constructor(...args) {
    super(...args);
    this.root = new DirectoryType(this);
  }

  clear() {
    return this.flushdb();
  }

  close() {
    return this.disconnect();
  }
}

module.exports = Redis;
