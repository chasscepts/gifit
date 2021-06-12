/* eslint-disable no-bitwise */

const lsb = (num) => [num & 0xFF, num >> 8];

export default {
  lsb,
};
