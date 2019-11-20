const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('Dir', async () => {
  const dirA = redis.root.Dir('A');
  const dirAa = dirA.Dir('a');

  expect(() => dirA.Dir()).toThrow('key can not be undefined');

  await dirA.Number('num').set(10);
  await dirAa.Number('num').set(100);

  expect(await redis.keys('*')).toEqual(['A/a/num', 'A/num']);
  expect(await dirA.has('num')).toEqual(true);
  expect(await dirA.has('a/num')).toEqual(true); // deprecated
  expect(await dirAa.has('num')).toEqual(true);

  expect(await dirA.del('num')).toEqual(1);
  expect(await dirA.del('num')).toEqual(0);
  expect(await dirA.has('num')).toEqual(false);
  expect(await dirA.has('num')).toEqual(false);
  expect(await dirAa.has('num')).toEqual(true);
});

afterAll(() => {
  redis.close();
});
