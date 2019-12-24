const BigNumber = require('bignumber.js');
const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('BigNumber', async () => {
  const bigNumber = redis.root.BigNumber('bigNumber');

  expect(await bigNumber.exist()).toEqual(false);
  expect(await bigNumber.get()).toEqual(undefined);
  expect(await bigNumber.inc()).toEqual(BigNumber(1));

  await redis.set(bigNumber.key, 'qwert');
  await expect(bigNumber.get()).rejects.toThrow('expect a to match');

  await expect(bigNumber.set(null)).rejects.toThrow('expect a finite bigNumber');
  expect(await bigNumber.set(100)).toEqual(true);
  expect(await bigNumber.get()).toEqual(BigNumber(100));

  await expect(bigNumber.inc(true)).rejects.toThrow('expect a finite bigNumber');
  expect(await bigNumber.inc()).toEqual(BigNumber(101));
  expect(await bigNumber.inc(99)).toEqual(BigNumber(200));
  expect(await bigNumber.inc(-200.5)).toEqual(BigNumber(-0.5));

  const value = BigNumber(-2 / 3 - 1e9).pow(11);
  expect(await bigNumber.set(value)).toEqual(true);
  expect((await bigNumber.get()).toString(10)).toEqual(value.toString(10));
});

afterAll(() => {
  redis.close();
});
