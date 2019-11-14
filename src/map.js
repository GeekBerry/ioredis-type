const HashTableValue = require('./table');

/**
 * Map interface hash table
 */
class MapValue extends HashTableValue {
  async set(key, value) {
    return super.set(key, JSON.stringify(value));
  }

  async get(key) {
    const value = await super.get(key);
    if (value === null) {
      return undefined;
    }
    return JSON.parse(value);
  }

  async delete(key) {
    return this.del(key);
  }
}

module.exports = MapValue;
