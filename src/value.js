const Type = require('./type');

class Value extends Type {
  async exists() {
    return Boolean(await this.ioredis.exists(this.key));
  }

  async clear() {
    return this.ioredis.del(this.key);
  }
}

module.exports = Value;
