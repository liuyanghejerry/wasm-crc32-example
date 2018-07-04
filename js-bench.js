const fs = require('fs');
const {
  crc32: crc32ByJs
} = require('./crc32');
const {
  buf: crc32ByJs2
} = require('crc-32');
const {
  crc32: crc32ByJs3
} = require('crc');
const {
  crc32: crc32ByJs4
} = require('js-crc');
const {
  calculate: crc32ByJs5
} = require('sse4_crc32');
const Benchmark = require('benchmark');

const testSource = fs.readFileSync('./fixture/test.txt', 'utf-8');

const text = testSource;

const textInU8 = stringToU8(text);
console.log('0x' + crc32ByJs(textInU8).toString(16));
console.log('0x' + crc32ByJs2(textInU8).toString(16));
console.log('0x' + crc32ByJs3(textInU8).toString(16));
console.log('0x' + crc32ByJs4(textInU8));
// Due to usage of SSE instruction, this will be the fastest one.
// However, the POLY is a different one.
// This is why the checksum is not equal to others.
console.log('0x' + crc32ByJs5(textInU8).toString(16));

const suite = new Benchmark.Suite;

// add tests
suite
  .add('crc32ByJs', function () {
    crc32ByJs(textInU8);
  })
  .add('crc-32', function () {
    crc32ByJs2(textInU8);
  })
  .add('crc', function () {
    crc32ByJs3(textInU8);
  })
  .add('js-crc', function () {
    crc32ByJs4(textInU8);
  })
  .add('sse4_crc32', function () {
    crc32ByJs5(textInU8);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({
    'async': true
  });

function stringToU8(text) {
  return Buffer.from(text, 'utf8');
}
