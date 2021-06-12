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

const fromBits = (bits) => {
  let accm = 0;
  for (let i = 0; i < 8; i += 1) {
    if (bits[i]) {
      accm += 2 ** (7 - i);
    }
  }
  return accm;
};

export default {
  lsb,
  toBits,
  fromBits,
};
