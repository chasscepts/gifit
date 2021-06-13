import Utils from './utils';

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
};
