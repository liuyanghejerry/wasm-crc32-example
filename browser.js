// for benchmark
import _ from 'lodash';
window.Benchmark = require('benchmark');

const {
  crc32: crc32ByJs
} = require('./crc32');

import wasmFile from './target/wasm32-unknown-unknown/release/wasm_crc32_example.wasm';

import testSource from './fixture/test.txt';

WebAssembly.instantiate(wasmFile, {
  env: {
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({
      initial: 0,
      maximum: 65536,
    }),
    table: new WebAssembly.Table({
      initial: 0,
      maximum: 0,
      element: 'anyfunc',
    }),

    logInt: (num) => {
      console.log('logInt: ', num);
    },
  },
}).then((wasmValues) => {
  const wasmInstance = wasmValues.instance;

  const {
    memory,
    crc32: crc32ByWasm,
  } = wasmInstance.exports;

  const text = testSource;
  memory.grow(2);

  const textInU8 = stringToU8(text);
  const offset = 10 * 1024;
  const byteLength = copyToMemory(textInU8, memory, offset);
  console.log(crc32ByWasm(offset, byteLength).toString(16));
  console.log(crc32ByJs(textInU8).toString(16));
  
  const suite = new Benchmark.Suite;

  suite
    .add('crc32ByJs', function () {
      crc32ByJs(textInU8);
    })
    .add('crc32ByWasm', function () {
      crc32ByWasm(0, byteLength);
    })
    .add('crc32ByWasm (copy)', function () {
      const byteLength = copyToMemory(textInU8, memory, offset);
      crc32ByWasm(offset, byteLength);
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

}).catch(console.error);

function stringToU8(text) {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

function copyToMemory(textInU8, memory, offset) {
  const byteLength = textInU8.byteLength;

  const view = new Uint8Array(memory.buffer);
  for (let i = 0; i < byteLength; i++) {
    view[i + offset] = textInU8[i];
  }
  return byteLength;
}