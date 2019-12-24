const BigNumber = require('bignumber.js');
const Value = require('./value');

const BASE = 16;

class BigNumberValue extends Value {
  async set(value) {
    const bigNumber = BigNumber(value);
    if (!bigNumber.isFinite()) {
      throw new Error(`expect a finite bigNumber, got ${bigNumber}`);
    }
    return super.set(bigNumber.toString(BASE));
  }

  async get() {
    const value = await super.get();
    return value === null ? undefined : BigNumber(value, BASE);
  }

  async inc(value = 1) {
    let bigNumber = await this.get() || BigNumber(0);
    bigNumber = bigNumber.plus(value);
    await this.set(bigNumber);
    return bigNumber;
  }
}

module.exports = BigNumberValue;
