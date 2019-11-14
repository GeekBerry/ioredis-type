const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('List', async () => {
  const list = redis.root.List('list');

  expect(await list.push('a', 'b', 'c', 'd')).toEqual(4);
  expect(await list.push(['e', 'f'])).toEqual(6);
  expect(await list.push()).toEqual(0);

  expect(await list.pop()).toEqual('f');
  expect(await list.pop(2)).toEqual(['e', 'd']);
  expect(await list.pop(0)).toEqual([]);
  expect(await list.pop(1)).toEqual(['c']);
  await expect(list.pop(-1)).rejects.toThrow('Pop count must be positive integer');
  expect(await list.pop(1000)).toEqual(['b', 'a']);
  expect(await list.pop()).toEqual(undefined);
  expect(await list.pop(10)).toEqual([]);
});

test('List compare Array', async () => {
  const array = ['a', 'b', 'c', 'd'];
  const reverse = ['d', 'c', 'b', 'a'];

  const list = redis.root.List('listArray');
  await list.push('a', 'b', 'c', 'd');
  expect(await list.size()).toEqual(4);

  expect(array.slice(0)).toEqual(['a', 'b', 'c', 'd']);
  expect(await list.slice(0)).toEqual(['a', 'b', 'c', 'd']);
  expect(reverse.slice(0)).toEqual(['d', 'c', 'b', 'a']);
  expect(await list.slice(0, undefined, true)).toEqual(['d', 'c', 'b', 'a']);

  expect(array.slice(1)).toEqual(['b', 'c', 'd']);
  expect(await list.slice(1)).toEqual(['b', 'c', 'd']);
  expect(reverse.slice(1)).toEqual(['c', 'b', 'a']);
  expect(await list.slice(1, undefined, true)).toEqual(['c', 'b', 'a']);

  expect(array.slice(1, 3)).toEqual(['b', 'c']);
  expect(await list.slice(1, 3)).toEqual(['b', 'c']);
  expect(reverse.slice(1, 3)).toEqual(['c', 'b']);
  expect(await list.slice(1, 3, true)).toEqual(['c', 'b']);

  expect(array.slice(-2)).toEqual(['c', 'd']);
  expect(await list.slice(-2)).toEqual(['c', 'd']);
  expect(reverse.slice(-2)).toEqual(['b', 'a']);
  expect(await list.slice(-2, undefined, true)).toEqual(['b', 'a']);

  expect(array.slice(-2, -1)).toEqual(['c']);
  expect(await list.slice(-2, -1)).toEqual(['c']);
  expect(reverse.slice(-2, -1)).toEqual(['b']);
  expect(await list.slice(-2, -1, true)).toEqual(['b']);

  expect(array.slice(2, 0)).toEqual([]);
  expect(await list.slice(2, 0)).toEqual([]);
  expect(reverse.slice(2, 0)).toEqual([]);
  expect(await list.slice(-2, 0, true)).toEqual([]);

  expect(array.slice(-2, 0)).toEqual([]);
  expect(await list.slice(-2, 0)).toEqual([]);
  expect(reverse.slice(-2, 0)).toEqual([]);
  expect(await list.slice(-2, 0, true)).toEqual([]);

  expect(await list.index(-5)).toEqual(undefined);
  expect(await list.index(-4)).toEqual('a');
  expect(await list.index(-1)).toEqual('d');
  expect(await list.index(0)).toEqual('a');
  expect(await list.index(3)).toEqual('d');
  expect(await list.index(4)).toEqual(undefined);
});

afterAll(() => {
  redis.close();
});
