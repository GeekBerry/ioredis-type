const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('ZSet', async () => {
  const zset = redis.root.ZSet('zset');

  expect(await zset.exists()).toEqual(false);
  expect(await zset.select()).toEqual({});

  expect(await zset.index(0)).toEqual(undefined);
  expect(await zset.index(-1)).toEqual(undefined);
  expect(await zset.indexScore(0)).toEqual(undefined);

  expect(await zset.get('key')).toEqual(undefined);
  expect(await zset.set('key', 0)).toEqual(1);
  expect(await zset.indexScore(0)).toEqual(0);

  expect(await zset.set('key', 3.14)).toEqual(0);
  expect(await zset.get('key')).toEqual(3.14);
  expect(await zset.indexScore(0)).toEqual(3.14);

  expect(await zset.del('key')).toEqual(1);
  expect(await zset.del('key')).toEqual(0);
  expect(await zset.indexScore(0)).toEqual(undefined);

  expect(await zset.size()).toEqual(0);

  await zset.set('A', 0);
  await zset.set('B', 1);
  await zset.set('C', 2);
  await zset.set('C`', 2);
  await zset.set('D', 3);
  await zset.set('E', 4);
  await zset.set('E`', 4);
  await zset.set('F', 5);

  expect(await zset.count()).toEqual(8);
  expect(await zset.count({ min: 3 })).toEqual(4);
  expect(await zset.count({ max: 0 })).toEqual(1);
  expect(await zset.count({ min: 1, max: 3 })).toEqual(4);
  expect(await zset.count({ min: 3, max: 1 })).toEqual(0);

  expect(await zset.select()).toEqual({ A: 0, B: 1, C: 2, 'C`': 2, D: 3, E: 4, 'E`': 4, F: 5 });
  expect(await zset.select({ min: 2, max: 3, limit: 2 })).toEqual({ C: 2, 'C`': 2 });
  expect(await zset.select({ min: 2, max: 3, skip: 1, limit: 1 })).toEqual({ 'C`': 2 });
  expect(await zset.select({ min: 2, max: 3, skip: 1 })).toEqual({ 'C`': 2, D: 3 });
  expect(await zset.select({ min: 2, max: 3, limit: 2, reverse: true })).toEqual({ D: 3, 'C`': 2 });

  await expect(zset.delScore()).rejects.toThrow('expect a finite number');

  expect(await zset.delScore(4)).toEqual(2);
  expect(await zset.slice(0)).toEqual(['A', 'B', 'C', 'C`', 'D', 'F']);

  expect(await zset.remove({ min: 2, max: 3 })).toEqual(3);
  expect(await zset.slice(0)).toEqual(['A', 'B', 'F']);

  expect(await zset.remove({ max: 0 })).toEqual(1);
  expect(await zset.slice(0)).toEqual(['B', 'F']);

  expect(await zset.remove({ min: 5 })).toEqual(1);
  expect(await zset.slice(0)).toEqual(['B']);
});

test('ZSet compare Array', async () => {
  const array = ['a', 'b', 'c', 'd'];
  const reverse = ['d', 'c', 'b', 'a'];

  const zset = redis.root.ZSet('zsetArray');
  await zset.set('a', 1);
  await zset.set('c', 3);
  await zset.set('b', 2);
  await zset.set('d', 3);
  expect(await zset.size()).toEqual(4);

  expect(array.slice(0)).toEqual(['a', 'b', 'c', 'd']);
  expect(await zset.slice(0)).toEqual(['a', 'b', 'c', 'd']);
  expect(reverse.slice(0)).toEqual(['d', 'c', 'b', 'a']);
  expect(await zset.slice(0, undefined, true)).toEqual(['d', 'c', 'b', 'a']);

  expect(array.slice(0, 0)).toEqual([]);
  expect(await zset.slice(0, 0)).toEqual([]);
  expect(reverse.slice(0, 0)).toEqual([]);
  expect(await zset.slice(0, 0, true)).toEqual([]);

  expect(array.slice(1)).toEqual(['b', 'c', 'd']);
  expect(await zset.slice(1)).toEqual(['b', 'c', 'd']);
  expect(reverse.slice(1)).toEqual(['c', 'b', 'a']);
  expect(await zset.slice(1, undefined, true)).toEqual(['c', 'b', 'a']);

  expect(array.slice(1, 3)).toEqual(['b', 'c']);
  expect(await zset.slice(1, 3)).toEqual(['b', 'c']);
  expect(reverse.slice(1, 3)).toEqual(['c', 'b']);
  expect(await zset.slice(1, 3, true)).toEqual(['c', 'b']);

  expect(array.slice(-2)).toEqual(['c', 'd']);
  expect(await zset.slice(-2)).toEqual(['c', 'd']);
  expect(reverse.slice(-2)).toEqual(['b', 'a']);
  expect(await zset.slice(-2, undefined, true)).toEqual(['b', 'a']);

  expect(array.slice(-2, -1)).toEqual(['c']);
  expect(await zset.slice(-2, -1)).toEqual(['c']);
  expect(reverse.slice(-2, -1)).toEqual(['b']);
  expect(await zset.slice(-2, -1, true)).toEqual(['b']);

  expect(array.slice(2, 0)).toEqual([]);
  expect(await zset.slice(2, 0)).toEqual([]);
  expect(reverse.slice(2, 0)).toEqual([]);
  expect(await zset.slice(-2, 0, true)).toEqual([]);

  expect(array.slice(-2, 0)).toEqual([]);
  expect(await zset.slice(-2, 0)).toEqual([]);
  expect(reverse.slice(-2, 0)).toEqual([]);
  expect(await zset.slice(-2, 0, true)).toEqual([]);

  expect(await zset.index(-5)).toEqual(undefined);
  expect(await zset.index(-4)).toEqual('a');
  expect(await zset.index(-1)).toEqual('d');
  expect(await zset.index(0)).toEqual('a');
  expect(await zset.index(3)).toEqual('d');
  expect(await zset.index(4)).toEqual(undefined);
});

test('ZSet intersection', async () => {
  const allZSet = redis.root.ZSet('all');
  const oddZSet = redis.root.ZSet('odd');

  for (let i = 1; i < 10; i += 1) {
    await allZSet.set(i * 100, i);
  }

  for (let i = 1; i < 10; i += 2) {
    await oddZSet.set(i * 100, i);
  }

  const all = await allZSet.slice(1, 5);
  const min = await allZSet.get(all[0]);
  const max = await allZSet.get(all[all.length - 1]);
  const object = await oddZSet.select({ min, max });
  const odd = Object.keys(object);

  expect(all).toEqual(['200', '300', '400', '500']);
  expect(odd).toEqual(['300', '500']);
});

afterAll(() => {
  redis.close();
});
