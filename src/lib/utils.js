/* eslint-disable no-bitwise */

const lsb = (number) => [number & 0xFF, number >> 8];

/**
 * Converts a number to an array of length 8.
 * Each item in the array is set to true if corresponding bit
 * in binary representation of number is 1 and false otherwise.
 * @param {Number} number to convert
 * @returns an array of length 8
 */
const toBits = (number) => {
  if (number < 0 || number > 255) {
    throw new Error('Numner must be in the range (1, 255) inclusive');
  }
  const bits = [
    !!(number & 128),
    !!(number & 64),
    !!(number & 32),
    !!(number & 16),
    !!(number & 8),
    !!(number & 4),
    !!(number & 2),
    !!(number & 1),
  ];

  const isset = (pos) => {
    if (pos < 0 || pos > 7) {
      return false;
    }
    return bits[pos];
  };

  return {
    bits,
    isset,
  };
};

/**
 * Treats an array of length 8 as a binary representation of a number
 * and converts it to it's decimal equivalent.
 * @param {Array} bits an array of length 8
 * @returns {Number} a decimal number
 */
const fromBits = (bits) => {
  let accm = 0;
  for (let i = 0; i < 8; i += 1) {
    if (bits[i]) {
      accm += 2 ** (7 - i);
    }
  }
  return accm;
};

const byteLength = (ctLength) => {
  const getLength = (n) => 2 ** (n + 1);
  let N = 1;
  let length = getLength(N);
  while (length < ctLength) {
    N += 1;
    length = getLength(N);
    if (length > ctLength) {
      throw new Error('color table length MUST be a power of 2.');
    }
  }

  const rslt = [0, 0, 0];
  const { bits } = toBits(N);
  for (let i = 0; i < rslt.length; i += 1) {
    if (bits[i + 5]) {
      rslt[i] = 1;
    }
  }
  return rslt;
};

export default {
  lsb,
  toBits,
  fromBits,
  byteLength,
};
