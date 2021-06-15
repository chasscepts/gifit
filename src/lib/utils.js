/* eslint-disable no-bitwise */

const EXTENSION_INTRODUCER = 0x21;

const GRAPHIC_CONTROL_LABEL = 0xF9;

const APPLICATION_EXTENSION_LABEL = 0xFF;

const BLOCK_TERMINATOR = 0;

const TRAILER = 0x3B;

const MAX_TABLE_LENGTH = 768; //  3 * 256

const DISPOSAL_METHODS = {
  NOT_SPECIFIED: 0,
  DO_NOT_DISPOSE: 1,
  RESTORE_TO_BACKGROUND: 2,
  RESTORE_TO_PREVIOUS: 3,
};

const HEADER = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // GIF89a

const lsb = (number) => [number & 0xFF, number >> 8];

const loop = (times, callback) => [...Array(times)].forEach((val, i) => callback(i));

const binary = (() => ({
  bits: (number, size) => {
    let mask = 1;
    const result = Array(size);
    loop(size, (i) => {
      result[i] = !!(mask & number);
      mask <<= 1;
    });
    return result;
  },
  decimal: (bits) => bits.reduce((memo, current, idx) => {
    if (current) memo += 2 ** idx;
    return memo;
  }, 0),
}))();

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
  const n = bits.length;
  const m = n - 1;
  for (let i = 0; i < n; i += 1) {
    if (bits[i]) {
      accm += 2 ** (m - i);
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

const logicalScreenDescriptor = (
  options = {
    width: 0,
    height: 0,
    resolution: 0,
    sorted: false,
    ctLength: 0,
    bgIndex: 0,
    aspectRatio: 0,
  },
) => {
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
  rslt.push(fromBits(ctBits), options.bgIndex || 0, options.aspectRatio || 0);

  return rslt;
};

// Netscape Looping Block: Application Extension Block
const loopBlock = (options = { loopTimes: 0 }) => {
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

/**
 *
 * @param {Array<Number>} ct color table
 * @returns {{ct: Array<Number>, length: number, N: number}}
 */
const normalizeColorTable = (ct) => {
  let { length } = ct;
  let n = 0;
  if (length > MAX_TABLE_LENGTH) {
    ct.splice(MAX_TABLE_LENGTH);
    n = 8;
    length = MAX_TABLE_LENGTH;
  } else {
    let temp = 0;
    while (temp < length) {
      temp = 3 * 2 ** n;
      if (temp === length) {
        break;
      }
      if (temp > length) {
        while (temp > length) {
          ct.push(0);
          length += 1;
        }
        break;
      }
      n += 1;
    }
  }

  length /= 3;

  return {
    ct,
    length,
    N: n - 1,
  };
};

const initCodeTable = (n) => [...Array((2 ** n) + 2)].map((val, i) => `${i}`);

const bitStream = () => {
  const stream = [];
  const BYTE_SIZE = 8;
  let bitsPipe = [];
  const raw = [];

  const trimPipe = () => {
    while (bitsPipe.length >= BYTE_SIZE) {
      stream.push(binary.decimal(bitsPipe.slice(0, BYTE_SIZE)));
      bitsPipe = bitsPipe.slice(BYTE_SIZE);
    }
  };

  const push = (number, bitSize) => {
    raw.push(number);
    const bits = binary.bits(number, bitSize);
    bits.forEach((b) => bitsPipe.push(b));
    trimPipe();
  };

  const flush = () => {
    trimPipe();
    if (bitsPipe.length <= 0) return;
    while (bitsPipe.length < BYTE_SIZE) {
      bitsPipe.push(false);
    }
    stream.push(binary.decimal(bitsPipe));
  };

  return {
    push,
    flush,
    toArray: () => [...stream],
    raw: () => raw,
  };
};

const imageBitStream = (n, stream = null) => {
  if (!stream) {
    stream = [];
  }
  stream.push(n);
  const BYTE_SIZE = 8;
  let bitsPipe = [];
  let size = 0;
  let sizeIndex = stream.length;
  stream.push(0);

  const addByte = (byte) => {
    if (size === 255) {
      sizeIndex = stream.length;
      size = 0;
      stream.push(0);
    }
    stream.push(byte);
    size += 1;
    stream[sizeIndex] = size;
  };

  const trimPipe = () => {
    while (bitsPipe.length >= BYTE_SIZE) {
      addByte(binary.decimal(bitsPipe.slice(0, BYTE_SIZE)));
      bitsPipe = bitsPipe.slice(BYTE_SIZE);
    }
  };

  const push = (number, bitSize) => {
    const bits = binary.bits(number, bitSize);
    bits.forEach((b) => bitsPipe.push(b));
    trimPipe();
  };

  const flush = () => {
    trimPipe();
    if (bitsPipe.length > 0) {
      while (bitsPipe.length < BYTE_SIZE) {
        bitsPipe.push(false);
      }
      addByte(binary.decimal(bitsPipe));
    }
    if (size !== 0) {
      stream.push(0);
    }
  };

  return {
    push,
    flush,
    toArray: () => [...stream],
  };
};

export default {
  HEADER,
  DISPOSAL_METHODS,
  TRAILER,
  lsb,
  loop,
  toBits,
  fromBits,
  toBinary,
  byteLength,
  uint8ToBase64String,
  logicalScreenDescriptor,
  loopBlock,
  gce,
  imageDescriptor,
  normalizeColorTable,
  initCodeTable,
  bitStream,
  imageBitStream,
};
