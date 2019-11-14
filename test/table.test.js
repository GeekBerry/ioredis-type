const redis = require('./index');

beforeAll(async () => {
  await redis.clear();
});

test('Table', async () => {
  const table = redis.root.Table('table');

  expect(await table.insert()).toEqual(false);

  await table.insert({
    t: true,
    f: false,
    u: undefined,
    n: null,
    s: '',
    i: 0,
    a: ['A', 'B,C'],
  });

  const created = await table.select();
  expect(created.t).toEqual('true');
  expect(created.f).toEqual('false');
  expect(created.u).toEqual(undefined);
  expect(created.n).toEqual('');
  expect(created.s).toEqual('');
  expect(created.i).toEqual('0');
  expect(created.a).toEqual('A,B,C');

  expect(await table.size()).toEqual(6); // except 'u'

  await table.insert({
    i: 1,
    s: 'string',
    a: ['C', ['B', 'A']],
  });

  const updated = await table.select();
  expect(updated.t).toEqual('true');
  expect(updated.f).toEqual('false');
  expect(updated.u).toEqual(undefined);
  expect(updated.n).toEqual('');
  expect(updated.s).toEqual('string');
  expect(updated.i).toEqual('1');
  expect(updated.a).toEqual('C,B,A');

  expect(await table.select({})).toEqual({});
  expect(await table.select({ i: true, s: false })).toEqual({ i: '1' });
  expect(await table.select([])).toEqual({});
  expect(await table.select(['a', 'u'])).toEqual({ a: 'C,B,A' });
  await expect(table.select(true)).rejects.toThrow('unknown fields type');

  expect(await table.inc('i', 1)).toEqual(2);
  expect(await table.inc('i', -2.5)).toEqual(-0.5);

  await expect(table.inc(NaN)).rejects.toThrow('inc value must be a number');

  expect(await table.has('key')).toEqual(false);
  expect(await table.get('key')).toEqual(undefined);
  expect(await table.set('key', 'xxx')).toEqual(1);
  expect(await table.get('key')).toEqual('xxx');
  expect(await table.set('key', 'xxx')).toEqual(0);
  expect(await table.del('key')).toEqual(1);
  expect(await table.del('key')).toEqual(0);
  expect(await table.del()).toEqual(0);

  expect(await redis.root.Table('notExist').select()).toEqual(undefined);
});

afterAll(() => {
  redis.close();
});
