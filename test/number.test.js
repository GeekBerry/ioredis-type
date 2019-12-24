const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('Number', async () => {
  const number = redis.root.Number('number');

  expect(await number.exist()).toEqual(false);
  expect(await number.get()).toEqual(undefined);

  await expect(number.set('100')).rejects.toThrow('expect a finite number');
  expect(await number.set(100)).toEqual(true);
  expect(await number.get()).toEqual(100);

  await expect(number.inc('5')).rejects.toThrow('expect a finite number');
  expect(await number.inc()).toEqual(101);
  expect(await number.inc(99)).toEqual(200);
  expect(await number.inc(-200.5)).toEqual(-0.5);
});

afterAll(() => {
  redis.close();
});
