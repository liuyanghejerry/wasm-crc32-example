// The original code was from http://create.stephan-brumme.com/crc32/#slicing-by-8
// and its license is http://create.stephan-brumme.com/disclaimer.html
// I changed it a little thus made it play well with JavaScript 
const POLY = 0xedb88320;
const TABLE = makeTable(POLY);
const TABLE8 = (function () {
  const tab = Array(8);
  for (let i = 0; i < 8; i++) {
    tab[i] = new Uint32Array(256);
  }
  tab[0] = makeTable(POLY);
  for (let i = 0; i <= 0xFF; i++) {
    tab[1][i] = (tab[0][i] >>> 8) ^ tab[0][tab[0][i] & 0xFF];
    tab[2][i] = (tab[1][i] >>> 8) ^ tab[0][tab[1][i] & 0xFF];
    tab[3][i] = (tab[2][i] >>> 8) ^ tab[0][tab[2][i] & 0xFF];
    tab[4][i] = (tab[3][i] >>> 8) ^ tab[0][tab[3][i] & 0xFF];
    tab[5][i] = (tab[4][i] >>> 8) ^ tab[0][tab[4][i] & 0xFF];
    tab[6][i] = (tab[5][i] >>> 8) ^ tab[0][tab[5][i] & 0xFF];
    tab[7][i] = (tab[6][i] >>> 8) ^ tab[0][tab[6][i] & 0xFF];
  }
  return tab;
})();

function makeTable(poly) {
  const tab = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      if (crc & 1 === 1) {
        crc = (crc >>> 1) ^ poly;
      } else {
        crc >>>= 1;
      }
      tab[i] = crc;
    }
  }
  return tab;
}

function readU32(buf, offset) {
  return buf[0 + offset] + ((buf[1 + offset]) << 8) + ((buf[2 + offset]) << 16) + ((buf[3 + offset]) << 24);
}

// buf should be Uint8Array
function crc32(buf) {
  let crc = ~0;
  let leftLength = buf.byteLength;
  let bufPos = 0;
  while (leftLength >= 8) {
    crc ^= readU32(buf, bufPos);
    crc = TABLE8[0][buf[7 + bufPos]] ^
          TABLE8[1][buf[6 + bufPos]] ^
          TABLE8[2][buf[5 + bufPos]] ^
          TABLE8[3][buf[4 + bufPos]] ^
          TABLE8[4][(crc >>> 24) & 0xFF] ^
          TABLE8[5][(crc >>> 16) & 0xFF] ^
          TABLE8[6][(crc >>> 8) & 0xFF] ^
          TABLE8[7][crc & 0xFF];
    bufPos += 8;
    leftLength -= 8;
  }
  for (let byte = 0; byte < leftLength; byte++) {
    crc = TABLE[(crc & 0xFF) ^ buf[byte + bufPos]] ^ (crc >>> 8);
  }
  return ~crc;
}

module.exports = {
  crc32,
};