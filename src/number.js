const Value = require('./value');

class NumberValue extends Value {
  async set(number) {
    if (!Number.isFinite(number)) {
      throw new Error(`expect a finite number, got ${number}`);
    }
    return super.set(number);
  }

  async get() {
    const value = await super.get();
    return value === null ? undefined : Number(value);
  }

  async inc(number = 1) {
    if (!Number.isFinite(number)) {
      throw new Error(`expect a finite number, got ${number}`);
    }

    return Number(await this.ioredis.incrbyfloat(this.key, number));
  }

  async dec(number) {
    return this.inc(-number);
  }
}

module.exports = NumberValue;
