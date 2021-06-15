import Utils from './utils';

const minimumBitsSize = (number) => {
  if (number < 8) return 3;
  if (number < 16) return 4;
  if (number < 32) return 5;
  if (number < 64) return 6;
  if (number < 128) return 7;
  if (number < 256) return 8;
  if (number < 512) return 9;
  if (number < 1024) return 10;
  if (number < 2048) return 11;
  if (number < 4096) return 12;
  return 0;
};

const encode = (raw, ct, n) => {
  const index = (start) => ct.indexOf(raw[start], raw[start + 1], raw[start + 2]);
  const table = Utils.initCodeTable(n);
  const CC = table.length - 2;
  const EOI = CC + 1;
  let codeTable = [...table];
  const stream = Utils.bitStream();
  let codeSize = n + 1;
  stream.push(CC, codeSize);

  const addToTable = (val) => {
    const codeTableLength = codeTable.push(val);
    codeSize = minimumBitsSize(codeTableLength - 1);
    if (codeSize === 0) {
      codeTable = [...table];
      codeSize = n + 1;
      stream.push(CC, codeSize);
    }
  };

  let lastBufferIndex = index(0);
  let indexBuffer = `${lastBufferIndex}`;

  for (let i = 3, n = raw.length - 2; i < n; i += 3) {
    const k = index(i);
    const temp = indexBuffer + k;
    const tempIndex = codeTable.indexOf(temp);
    if (tempIndex < 0) {
      stream.push(lastBufferIndex, codeSize);
      addToTable(temp);
      indexBuffer = `${k}`;
      lastBufferIndex = k;
    } else {
      indexBuffer = temp;
      lastBufferIndex = tempIndex;
    }
  }

  stream.push(lastBufferIndex, codeSize);
  stream.push(EOI, codeSize);
  stream.flush();

  return stream.toArray();
};

const encodeImage = (raw, ct, n, gifArray) => {
  const index = (start) => ct.indexOf(raw[start], raw[start + 1], raw[start + 2]);
  const table = Utils.initCodeTable(n);
  const CC = table.length - 2;
  const EOI = CC + 1;
  let codeTable = [...table];
  const stream = Utils.imageBitStream(n, gifArray);
  let codeSize = n + 1;
  stream.push(CC, codeSize);

  const addToTable = (val) => {
    const codeTableLength = codeTable.push(val);
    codeSize = minimumBitsSize(codeTableLength - 1);
    if (codeSize === 0) {
      codeTable = [...table];
      codeSize = n + 1;
      stream.push(CC, codeSize);
    }
  };

  let lastBufferIndex = index(0);
  let indexBuffer = `${lastBufferIndex}`;

  for (let i = 3, n = raw.length - 2; i < n; i += 3) {
    const k = index(i);
    const temp = indexBuffer + k;
    const tempIndex = codeTable.indexOf(temp);
    if (tempIndex < 0) {
      stream.push(lastBufferIndex, codeSize);
      addToTable(temp);
      indexBuffer = `${k}`;
      lastBufferIndex = k;
    } else {
      indexBuffer = temp;
      lastBufferIndex = tempIndex;
    }
  }

  stream.push(lastBufferIndex, codeSize);
  stream.push(EOI, codeSize);
  stream.flush();
};

/**
 *{{ width: {Number}, height: 0, resolution: 0, sorted: false, ctLength: 0,}}
 * @param {Object} lsd Logical Screen Descriptor Parameters
 * @param {Number} lsd.width width of canvas
 * @param {Number} lsd.height height of canvas
 * @param {Number} lsd.resolution bits/pixel of original color palette
 * @param {Boolean} lsd.sorted true if global color table is sorted
 * in order of "decreasing importance,"
 * @param {Number} lsd.ctLength length of Global Color Table. This is automoyically derived
 * from gct when gct is provided
 * @param {Number} lsd.bgIndex BackgroundColor Index. Default is 0
 * @param {Number} lsd.aspectRatio Aspect Ratio
 * @param {Array<Number>} gct Global Color Table
 * @param {Object} loopBlock Netscape Lopping Block : Application Extension Block
 * @param {Number} loopBlock.loopTimes Number of times to repeat animation.
 * 0 implies repeat inifinitely.
 * @param {Array<Array<Number>>} images
 * @returns gif image
 */
const pack = (lsd, gct, loopBlock, images) => {
  if (gct) {
    const normalized = Utils.normalizeColorTable(gct);
    gct = normalized.ct;
    lsd.ctLength = normalized.length;
  }

  const gif = gct ? [...Utils.HEADER, ...Utils.logicalScreenDescriptor(lsd), ...gct]
    : [...Utils.HEADER, ...Utils.logicalScreenDescriptor(lsd)];

  const add = (block) => {
    block.forEach((byte) => gif.push(byte));
  };

  if (loopBlock) {
    add(Utils.loopBlock(loopBlock));
  }

  images.forEach((image) => add(image));

  gif.push(Utils.TRAILER);

  return gif;
};

export default {
  pack,
  encode,
  encodeImage,
};
