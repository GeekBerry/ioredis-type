const Type = require('./type');
const ListValue = require('./list');
const SortedSetValue = require('./zset');
const HashTableValue = require('./table');
const MapValue = require('./map');
const NumberValue = require('./number');

class DirectoryType extends Type {
  pathOf(key) {
    if (key === undefined) {
      throw new Error('key can not be undefined');
    }
    return this.key ? `${this.key}/${key}` : `${key}`;
  }

  has(key) {
    return this.ioredis.exists(this.pathOf(key));
  }

  del(key) {
    return this.ioredis.del(this.pathOf(key));
  }

  Dir(key) {
    return new DirectoryType(this.ioredis, this.pathOf(key));
  }

  List(key) {
    return new ListValue(this.ioredis, this.pathOf(key));
  }

  ZSet(key) {
    return new SortedSetValue(this.ioredis, this.pathOf(key));
  }

  Table(key) {
    return new HashTableValue(this.ioredis, this.pathOf(key));
  }

  Map(key) {
    return new MapValue(this.ioredis, this.pathOf(key));
  }

  Number(key) {
    return new NumberValue(this.ioredis, this.pathOf(key));
  }
}

module.exports = DirectoryType;
