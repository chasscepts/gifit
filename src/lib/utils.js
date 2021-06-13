/* eslint-disable no-bitwise */

const EXTENSION_INTRODUCER = 0x21;

const GRAPHIC_CONTROL_LABEL = 0xF9;

const APPLICATION_EXTENSION_LABEL = 0xFF;

const BLOCK_TERMINATOR = 0;

const DISPOSAL_METHODS = {
  NOT_SPECIFIED: 0,
  DO_NOT_DISPOSE: 1,
  RESTORE_TO_BACKGROUND: 2,
  RESTORE_TO_PREVIOUS: 3,
};

const HEADER = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // GIF89a

const lsb = (number) => [number & 0xFF, number >> 8];

/**
 * Converts a number to an array of length 8.
 * Each item in the array is set to true if corresponding bit
 * in binary representation of number is 1 and false otherwise.
 * CAUTION: This function truncates a number if it is greater than 255 (largest ubyte) !!!
 * @param {Number} number to convert
 * @returns an array of length 8
 */
const toBits = (number) => {
  if (number < 0 || number > 255) {
    throw new Error('Numner must be in the range (0, 255) inclusive');
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

const toBinary = (byte, numberOfBits) => {
  const rslt = [];
  for (let i = 0; i < numberOfBits; i += 1) {
    rslt.push(0);
  }
  const diff = 8 - numberOfBits;
  const { bits } = toBits(byte);
  for (let i = 0; i < numberOfBits; i += 1) {
    if (bits[i + diff]) {
      rslt[i] = 1;
    }
  }
  return rslt;
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

  return toBinary(N, 3);
};

const NBytes = (ctLength) => {
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

  return toBinary(N, 3);
};

const uint8ToBase64String = (data) => {
  const CHUNK_SIZE = 0x8000;
  const c = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    c.push(String.fromCharCode.apply(null, data.slice(i, i + CHUNK_SIZE)));
  }

  return btoa(c.join(''));
};

const logicalScreenDescriptor = (options = {
  width: 0, height: 0, resolution: 0, sorted: false, ctLength: 0,
}) => {
  const rslt = [...lsb(options.width), ...lsb(options.height)];
  const ctBits = [0, 0, 0, 0, 0, 0, 0, 0];
  if (options.ctLength) {
    const byteLength = NBytes(options.ctLength);
    let pos = 0;
    ctBits[pos] = 1;
    pos += 1;
    const resolution = options.resolution ? toBinary(options.resolution - 1, 3) : byteLength;
    for (let i = 0; i < resolution.length; i += 1) {
      ctBits[pos] = resolution[i];
      pos += 1;
    }
    if (options.sorted) {
      ctBits[pos] = 1;
    }
    pos += 1;
    for (let i = 0; i < resolution.length; i += 1) {
      ctBits[pos] = byteLength[i];
      pos += 1;
    }
  }
  rslt.push(fromBits(ctBits), 0, 0);

  return rslt;
};

// Netscape Looping Block: Application Extension Block
const loopingBlock = (options = { loopTimes: 0 }) => {
  const blockLength = 11;
  const subBlockLength = 3;
  const subBlockLabel = 1;
  const loopTimes = lsb(options.loopTimes);
  return [
    EXTENSION_INTRODUCER,
    APPLICATION_EXTENSION_LABEL,
    blockLength,
    0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, //  NETSCAPE2.0
    subBlockLength,
    subBlockLabel,
    loopTimes[0], loopTimes[1],
    BLOCK_TERMINATOR,
  ];
};

// Graphics Control Extension
const gce = (options = {
  delay: 0,
  transparentColorIndex: 0,
  transparentColorFlag: false,
  disposalMethod: 0,
  userInput: false,
}) => {
  const byteSize = 4;
  let transparentColorIndex = 0;

  const disposalMethodArray = toBits(options.disposalMethod).bits;
  const packedFieldArray = [0, 0, 0, 0, 0, 0, 0, 0];

  [5, 6, 7].forEach((i) => {
    if (disposalMethodArray[i]) {
      packedFieldArray[i - 2] = 1;
    }
  });
  if (options.userInput) {
    packedFieldArray[6] = 1;
  }
  if (options.transparentColorFlag) {
    packedFieldArray[7] = 1;
    if (options.transparentColorIndex) {
      transparentColorIndex = options.transparentColorIndex;
    }
  }

  const packedField = fromBits(packedFieldArray);
  const delayArray = lsb(options.delay);

  return [
    EXTENSION_INTRODUCER,
    GRAPHIC_CONTROL_LABEL,
    byteSize,
    packedField,
    delayArray[0],
    delayArray[1],
    transparentColorIndex,
    BLOCK_TERMINATOR,
  ];
};

const imageDescriptor = (options = {
  left: 0, top: 0, width: 0, height: 0, interlace: false, sorted: false, lctLength: 0,
}) => {
  const left = lsb(options.left);
  const top = lsb(options.top);
  const width = lsb(options.width);
  const height = lsb(options.height);
  const packedField = [0, 0, 0, 0, 0, 0, 0, 0];
  if (options.lctLength) {
    packedField[0] = 1;
    const lct = toBinary(options.lctLength, 3);
    [0, 1, 2].forEach((i) => {
      if (lct[i]) {
        packedField[i + 5] = 1;
      }
    });
  }
  if (options.interlace) {
    packedField[1] = 1;
  }
  if (options.sorted) {
    packedField[2] = 1;
  }

  return [
    0x2C,
    left[0], left[1],
    top[0], top[1],
    width[0], width[1],
    height[0], height[1],
    fromBits(packedField),
  ];
};

export default {
  HEADER,
  DISPOSAL_METHODS,
  lsb,
  toBits,
  fromBits,
  toBinary,
  byteLength,
  uint8ToBase64String,
  logicalScreenDescriptor,
  loopingBlock,
  gce,
  imageDescriptor,
};
