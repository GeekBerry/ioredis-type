const lodash = require('lodash');
const Value = require('./value');

class NumberValue extends Value {
  async set(number) {
    if (!lodash.isNumber(number)) {
      throw new Error(`must be a number, got ${number}`);
    }
    return this.ioredis.set(this.key, number);
  }

  async get() {
    const value = await this.ioredis.get(this.key);
    return value === null ? undefined : Number(value);
  }

  async inc(number = 1) {
    if (!lodash.isNumber(number)) {
      throw new Error(`inc value must be a number, got ${number}`);
    }

    const value = Number.isInteger(number)
      ? await this.ioredis.incrby(this.key, number)
      : await this.ioredis.incrbyfloat(this.key, number);

    return Number(value);
  }
}

module.exports = NumberValue;
