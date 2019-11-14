const lodash = require('lodash');
const Value = require('./value');

class HashTableValue extends Value {
  async size() {
    return this.ioredis.hlen(this.key);
  }

  async has(key) {
    const value = await this.ioredis.hexists(this.key, key);
    return Boolean(value);
  }

  async get(key) {
    const value = await this.ioredis.hget(this.key, key);
    return value === null ? undefined : value;
  }

  async set(key, value) {
    return this.ioredis.hset(this.key, key, value);
  }

  async del(...keys) {
    if (!keys.length) {
      return 0;
    }
    return this.ioredis.hdel(this.key, ...keys);
  }

  /**
   * @param key {string}
   * @param number {number}
   * @return {Promise<number>} after number
   */
  async inc(key, number) {
    if (!lodash.isNumber(number)) {
      throw new Error(`inc value must be a number, got ${number}`);
    }

    const value = Number.isInteger(number)
      ? await this.ioredis.hincrby(this.key, key, number)
      : await this.ioredis.hincrbyfloat(this.key, key, number);

    return Number(value);
  }

  async insert(object) {
    const value = lodash.pickBy(object, v => v !== undefined);
    if (!Object.keys(value).length) {
      return false;
    }
    const ret = await this.ioredis.hmset(this.key, value);
    return ret === 'OK';
  }

  async select(fields = undefined) {
    let object;

    if (fields === undefined) {
      object = await this.ioredis.hgetall(this.key);
    } else if (lodash.isArray(fields)) { // XXX: is the necessary
      const keys = fields;
      const values = keys.length ? await this.ioredis.hmget(this.key, keys) : []; // ioredis 'hmget' keys can not be empty
      object = lodash.pickBy(lodash.zipObject(keys, values), v => v !== null); // ioredis use null as undefined
    } else if (lodash.isPlainObject(fields)) {
      const keys = Object.keys(fields).filter(k => fields[k] === true);
      const values = keys.length ? await this.ioredis.hmget(this.key, keys) : []; // ioredis 'hmget' keys can not be empty
      object = lodash.pickBy(lodash.zipObject(keys, values), v => v !== null); // redis use null as undefined
    } else {
      throw new Error(`unknown fields type, fields=${fields}`);
    }

    if (!Object.keys(object).length && !(await this.ioredis.exists(this.key))) {
      return undefined;
    }
    return object;
  }
}

module.exports = HashTableValue;
