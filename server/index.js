import influx from 'influx';
import {promisifyAll} from 'bluebird';

const client = promisifyAll(influx({
  hosts: [
    {
      host: 'localhost'
    }
  ],
  database: 'test'

}));

const values = {
  count: 1,
  sessions: 2,
  eventLoopTime: 0,
  eventLoopCount: 0,
  totalTime: 0,
  memory: 100.86328125,
  loadAverage: 0,
  pcpu: 2.7,
  cputime: 0,
  pcpuUser: 0,
  pcpuSystem: 0,
  newSessions: 0,
  gcScavengeCount: 0,
  gcScavengeDuration: 0,
  gcFullCount: 0,
  gcFullDuration: 0
};

const tags = {
  appId: 'somerandomstring',
  host: 'somerandomstringstring',
  res: '1min'
};

const n = 10000;
let c = 0;

async function write() {
  console.time('Individual writes');
  for (let i = n; i > 0; i--) {
    await client.writePointAsync('individual', values, tags);
  }
  console.timeEnd('Individual writes');
}

async function writeBatch() {
  c++;
  console.log(c);
  console.time('Batch writes');
  const points = [];
  for (let i = n; i > 0; i--) {
    values.time = new Date();
    points.push([ values, tags ]);
  }
  await client.writePointsAsync('batch', points);
  console.timeEnd('Batch writes');

}

async function read() {
  console.time('Query all');
  const res = await client.queryAsync('SELECT count(count) from batch');
  console.timeEnd('Query all');
  console.log(res);
}

async function run() {
  console.time('Loop');
  while (1) {
    await writeBatch();
  }
  console.timeEnd('Loop');
}

run();
