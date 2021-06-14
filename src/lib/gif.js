import Utils from './utils';

// Initialize code table
// Always start by sending a clear code to the code stream.
// Read first index from index stream. This value is now the value for the index buffer
// <LOOP POINT>
// Get the next index from the index stream to the index buffer. We will call this index, K
// Is index buffer + K in our code table?
// Yes:
//   add K to the end of the index buffer
//   if there are more indexes, return to LOOP POINT
// No:
//   Add a row for index buffer + K into our code table with the next smallest code
//   Output the code for just the index buffer to our code steam
//   Index buffer is set to K
//   K is set to nothing
//   if there are more indexes, return to LOOP POINT
// Output code for contents of index buffer
// Output end-of-information code

const encode = (raw, ct) => {
  const index = (start) => ct.indexOf(raw[start], raw[start + 1], raw[start + 2]);
  // const MIN_CODE_SIZE = 8;
  const { codeTable, CC, EOI } = Utils.initCodeTable(ct.length);
  const codeStream = [CC];

  let lastBufferIndex = index(0);
  let indexBuffer = `${lastBufferIndex}`;

  for (let i = 3, n = raw.length - 2; i < n; i += 3) {
    const k = index(i);
    const temp = indexBuffer + k;
    const tempIndex = codeTable.indexOf(temp);
    if (tempIndex < 0) {
      codeTable.push(temp);
      codeStream.push(lastBufferIndex);
      indexBuffer = `${k}`;
      lastBufferIndex = k;
    } else {
      indexBuffer = temp;
      lastBufferIndex = tempIndex;
    }
  }

  codeStream.push(lastBufferIndex);
  codeStream.push(EOI);

  // console.log(codeTable);
  return codeStream;
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
};
