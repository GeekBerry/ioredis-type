const Type = require('./type');

class Value extends Type {
  async set(value) {
    const ret = await this.ioredis.set(this.key, value);
    return ret === 'OK';
  }

  async get() {
    return this.ioredis.get(this.key);
  }

  async exist() {
    return Boolean(await this.ioredis.exists(this.key));
  }

  async clear() {
    return this.ioredis.del(this.key);
  }
}

module.exports = Value;
