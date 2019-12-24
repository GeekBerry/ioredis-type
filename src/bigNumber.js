const BigNumber = require('bignumber.js');
const Value = require('./value');

const REGEX = /^0x(-)?[0-9a-f]+(\.[0-9a-f]+)?$/;

/*
 starts with '0x' to difference from redis number
 */
class BigNumberValue extends Value {
  async set(value) {
    const bigNumber = BigNumber(value);
    if (!bigNumber.isFinite()) {
      throw new Error(`expect a finite bigNumber, got ${bigNumber}`);
    }
    return super.set(`0x${bigNumber.toString(16)}`);
  }

  async get() {
    const value = await super.get();
    if (value === null) {
      return undefined;
    }

    if (!REGEX.test(value)) {
      throw new Error(`expect a to match ${REGEX}, got ${value}`);
    }
    return BigNumber(value.replace('0x', ''), 16);
  }

  async inc(value = 1) {
    // TODO update by transaction
    let bigNumber = await this.get() || BigNumber(0);
    bigNumber = bigNumber.plus(value);
    await this.set(bigNumber);
    return bigNumber;
  }
}

module.exports = BigNumberValue;
