/*
 跳跃表原理与实践
 @see https://www.cnblogs.com/steve-jiang/p/9206589.html
 */

const lodash = require('lodash');
const Value = require('./value');

class SortedSetValue extends Value {
  async size() {
    return this.ioredis.zcard(this.key);
  }

  /**
   * @param key {string}
   * @param scope {number}
   * @return {Promise<number>}
   */
  async set(key, scope) {
    return this.ioredis.zadd(this.key, scope, key);
  }

  async get(key) {
    const score = await this.ioredis.zscore(this.key, key);
    return score !== null ? Number(score) : undefined; // ioredis use null as undefined
  }

  async index(index) {
    const [key] = await this.ioredis.zrange(this.key, index, index);
    return key;
  }

  async indexScore(index) {
    const [, score] = await this.ioredis.zrange(this.key, index, index, 'WITHSCORES');
    return score ? Number(score) : undefined;
  }

  /**
   * @param key {string}
   * @return {Promise<number>}
   */
  async del(key) {
    return this.ioredis.zrem(this.key, key);
  }

  /**
   * @param scope {number}
   * @return {Promise<number>}
   */
  async delScore(scope) {
    if (!lodash.isNumber(scope)) {
      throw new Error(`scope must be a number, got ${scope}`);
    }
    return this.remove({ min: scope, max: scope });
  }

  async slice(start, stop, reverse = false) {
    if (stop === 0) {
      return [];
    }

    stop = stop === undefined ? -1 : stop - 1;

    return !reverse
      ? this.ioredis.zrange(this.key, start, stop)
      : this.ioredis.zrevrange(this.key, start, stop);
  }

  async count({ min = -Infinity, max = Infinity } = {}) {
    if (min === -Infinity) {
      min = '-inf';
    }

    if (max === Infinity) {
      max = '+inf';
    }

    return this.ioredis.zcount(this.key, min, max); // by scope
  }

  /**
   * @param [min=-Infinity] {number}
   * @param [max=Infinity] {number}
   * @param [skip] {number}
   * @param [limit] {number}
   * @param [reverse] {boolean}
   * @return {Promise<object>} Keys sorted
   */
  async select({ min = -Infinity, max = Infinity, skip, limit, reverse = false } = {}) {
    let args = [];
    if (min === -Infinity) {
      min = '-inf';
    }

    if (max === Infinity) {
      max = '+inf';
    }

    if (Number.isInteger(skip) && Number.isInteger(limit)) {
      args = ['LIMIT', skip, limit];
    } else if (!Number.isInteger(skip) && Number.isInteger(limit)) {
      args = ['LIMIT', 0, limit];
    } else if (Number.isInteger(skip) && !Number.isInteger(limit)) {
      args = ['LIMIT', skip, -1];
    }

    const array = !reverse
      ? await this.ioredis.zrangebyscore(this.key, min, max, 'WITHSCORES', ...args)
      : await this.ioredis.zrevrangebyscore(this.key, max, min, 'WITHSCORES', ...args);

    return lodash.mapValues(lodash.fromPairs(lodash.chunk(array, 2)), Number);
  }

  async remove({ min = -Infinity, max = Infinity }) {
    return this.ioredis.zremrangebyscore(this.key, min, max);
  }
}

module.exports = SortedSetValue;
