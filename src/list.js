/*
 @see https://blog.csdn.net/harleylau/article/details/80534159
 如果 List `L` 为空, 则等同于 `L` 不存在
 */

const Value = require('./value');

class ListValue extends Value {
  async size() {
    return this.ioredis.llen(this.key);
  }

  async push(...args) {
    if (args.length === 0) {
      return 0;
    }

    return this.ioredis.rpush(this.key, ...args);
  }

  async pop(count) {
    if (count === undefined) {
      const value = await this.ioredis.rpop(this.key);
      return value === null ? undefined : value;
    }

    // XXX: popMany, return array
    if (!Number.isInteger(count) || !(count >= 0)) {
      throw new Error(`Pop count must be positive integer, got "${count}"`);
    }
    if (count === 0) {
      return [];
    }
    const array = await this.ioredis.lrange(this.key, -count, -1);
    await this.ioredis.ltrim(this.key, 0, -count - 1);
    return array.reverse();
  }

  /**
   * @param index
   * @return {Promise<*>}
   */
  async index(index) {
    const value = await this.ioredis.lindex(this.key, index);
    return value === null ? undefined : value;
  }

  async slice(start, stop, reverse = false) {
    if (stop === 0) {
      return [];
    }

    stop = stop === undefined ? -1 : stop - 1;

    return !reverse
      ? this.ioredis.lrange(this.key, start, stop)
      : (await this.ioredis.lrange(this.key, -stop - 1, -start - 1)).reverse();
  }
}

module.exports = ListValue;
