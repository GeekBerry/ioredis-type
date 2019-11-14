# ioredis-type

redis type orm

## Installation
`npm install ioredis-type`

## Usage

### client

```javascript
const Redis = require('ioredis-type');

const redis = new Redis({
  // host: '127.0.0.1',
  // password: '',
  // port: 6379,
  // db: 0,
});
```

### List

```javascript
async function main() {
  const list = redis.root.List('list');

  await list.push('a', 'b', 'c', 'd');
  
  await list.pop(2);
  
  await list.slice(1);
  await list.slice(1, 3, true);
  await list.slice(1, undefined, true);
  
  await list.index(-4);
}

main().catch(()=>redis.close())
```

### ZSet

```javascript
async function main() {
  const zset = redis.root.ZSet('zset');

  await zset.push('a', 'b', 'c', 'd');
  
  await zset.set('a', 1);
  await zset.set('c', 3);
  await zset.set('b', 2);
  await zset.set('d', 3);
  
  await zset.slice(1);
  await zset.slice(1, 3, true);
  await zset.slice(1, undefined, true);
  
  await zset.index(-4);
}

main().catch(()=>redis.close())
```

### Table

```javascript
async function main() {
  const table = redis.root.Table('table');

  await table.insert({
      t: true,
      f: false,
      u: undefined,
      n: null,
      s: '',
      i: 0,
      a: ['A', 'B,C'],
    });
  
  await table.select();
}

main().catch(()=>redis.close())
```
