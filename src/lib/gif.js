import Utils from './utils';

/**
 * @typedef {Object} ColorTableConfig
 * @property {String} algorithm
 * @property {Boolean} dither
 * @property {Number} index index of the image to extract table from
 * @property {Number} length length of color array
 * @property {Number} order
 *
 * @typedef {Object} ImageConfig
 * @property {ColorTableConfig} lct Local Color Table
 * @property {Number} delay
 * The number of hundredths of a second to wait before moving on to the next scene.
 * @property {Number} disposalMethod number in the range 0 -3 inclusive.
 * @property {Number} left
 * @property {Number} top
 * @property {Number} width
 * @property {Number} height
 *
 * @typedef {Function} indexOf
 * @param {...Number || RGB} color
 * @returns {Number}
 *
 * @typedef {Object} ColorTable
 * @property {Array<Number} colors
 * @property {Number} length
 * @property {indexOf} indexOf
 */

const quatisation = (() => {
  const algorithms = Object.freeze({
    HISTOGRAM: 'Histogram',
    MEDIAN_CUT: 'Median Cut',
    MODIFIFIED_HISTOGRAM: 'Modified Histogram',
  });

  const sqr = (a) => a * a;

  /**
   * rgb representation of a color
   * @param {Number} r red component
   * @param {Number} g green component
   * @param {Number} b blue component
   * @returns
   */
  const RGB = (r, g, b) => ({
    r,
    g,
    b,
    distance: (rgb) => Math.sqrt(sqr(r - rgb.r) + sqr(g - rgb.g) + sqr(b - rgb.b)),
  });

  /**
   * Color Table
   * @param {Array<RGB>} pallete
   * @returns {ColorTable}
   */
  const ct = (pallete) => {
    const palleteLength = pallete.length;
    const length = palleteLength * 3;
    const colors = pallete.reduce((memo, rgb) => {
      memo.push(rgb.r);
      memo.push(rgb.g);
      memo.push(rgb.b);
      return memo;
    }, []);

    const indexOf = (r, g, b) => {
      let index = 0;
      let dist = pallete[0].distance(r, g, b);
      for (let i = 1; i < palleteLength; i += 1) {
        const temp = pallete[i].distance(r, g, b);
        if (temp < dist) {
          dist = temp;
          index = i;
        }
      }

      return index;
    };

    return {
      length,
      colors,
      indexOf,
    };
  };

  /**
   * Convert raw color to RGB Array
   * @param {Array<Number>} raw raw color array
   * @returns {Array<RGB>}
   */
  const getPallete = (raw) => {
    const length = Math.floor(raw.length / 3);
    const pallete = Array(length);
    for (let i = 0; i < length - 2; i += 1) {
      pallete[i] = RGB(pallete[i], pallete[i + 1], pallete[i + 2]);
    }

    return pallete;
  };

  /**
   *
   * @param {Array<Number>} image color table is extracted from this image
   * @param {ColorTableConfig} config
   * @returns {ColorTable}
   */
  const histogram = (image, config) => {

  };

  /**
   *
   * @param {Array<Number>} image color table is extracted from this image
   * @param {ColorTableConfig} config
   * @returns {ColorTable}
   */
  const modifiedHistogram = (image, config) => {

  };

  const medianCut = (() => {
    const ranges = (start, end) => {
      const mid = Math.floor((start + end) / 2);
      return [[start, mid], [mid + 1, end]];
    };

    const sortBy = (arr, prop) => arr.sort((a, b) => {
      if (a[prop] > b[prop]) return 1;
      if (a[prop] < b[prop]) return -1;
      return 0;
    });

    const sort = (arr) => {
      const r = { max: 0, min: 0 };
      const g = { max: 0, min: 0 };
      const b = { max: 0, min: 0 };
      arr.forEach((c) => {
        if (c.r > r.max) r.max = c.r;
        if (c.r < r.min) r.min = c.r;
        if (c.g > g.max) g.max = c.g;
        if (c.g < g.min) g.min = c.g;
        if (c.b > b.max) b.max = c.b;
        if (c.b < b.min) b.min = c.b;
      });

      const rDiff = r.max - r.min;
      const gDiff = g.max - g.min;
      const bDiff = b.max - b.min;
      const max = Math.max(rDiff, gDiff, bDiff);
      let prop = 'r';
      if (bDiff === max) prop = 'b';
      else if (gDiff === max) prop = 'g';
      sortBy(arr, prop);
    };

    const quantizeRecursive = (pallete, points, length) => {
      if (points.length > length) {
        return pallete;
      }
      const nextPoints = [];
      points.forEach((point) => {
        const p1 = point[0];
        const p2 = point[1];
        const r = ranges(p1, p2);
        nextPoints.push(r[0]);
        nextPoints.push(r[1]);

        const part = pallete.slice(p1, p2 + 1);
        sort(part);
        for (let i = 0, n = part.length; i < n; i += 1) {
          pallete[p1 + i] = part[i];
        }
      });
      if (points.length === length) {
        const result = Array(points.length);
        points.forEach((point, index) => {
          const start = point[0];
          const length = point[1] - start + 1;
          const memo = { r: 0, g: 0, b: 0 };
          result[index] = RGB(
            Math.round(memo.r / length),
            Math.round(memo.g / length),
            Math.round(memo.b / length),
          );
        });
        return result;
      }
      return quantizeRecursive(pallete, nextPoints, length);
    };

    /**
   *
   * @param {Array<Number>} image color table is extracted from this image
   * @param {ColorTableConfig} config
   * @returns {ColorTable}
   */
    const quantize = (image, config) => {
      let pallete = getPallete(image);
      let { length } = pallete;
      if (length <= config.length) {
        while (length < config.length) {
          pallete.push(RGB(0, 0, 0));
          length += 1;
        }
      } else {
        pallete = quantizeRecursive(image, [[0, pallete.length - 1]], config.length);
      }

      return ct(pallete);
    };

    return quantize;
  })();

  /**
   *
   * @param {Array<Number>} image color table is extracted from this image
   * @param {ColorTableConfig} config
   * @returns {ColorTable}
   */
  const extractColorTable = (image, config) => {
    let ct;
    if (config.algorithm === algorithms.HISTOGRAM) {
      ct = histogram(image, config);
    } else if (config.algorithm === algorithms.MODIFIFIED_HISTOGRAM) {
      ct = modifiedHistogram(image, config);
    } else {
      ct = medianCut(image, config);
    }

    return ct;
  };

  return {
    extractColorTable,
  };
})();

const push = (source, target) => source.forEach((num) => target.push(num));

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

/**
 * Encodes raw image to gif code stream
 * @param {Array<Number>} raw image
 * @param {Object} ct color table
 * @param {Function} ct.indexOf a method of ct that returns the index of a passed in color
 * @param {Number} n minimum code size
 * @param {Array<Number>} gifArray encoded bit streams are added to this array
 */
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
 * Processes an image and adds the result to a stream
 * @param {Array<Number} stream image streams are added to this array
 * @param {{config: ImageConfig, raw: Array<Number>}} image raw image to process
 * @param {Number} width width of this image
 * @param {Number} height height of this image
 * @param {ColorTable} gct
 */
const processImage = (stream, image, gct) => {
  const { config } = image;
  const gce = Utils.gce(config.delay, 0, false, config.disposalMethod, false);
  push(gce, stream);

  const options = Object.create(null);
  options.width = config.width;
  options.height = config.height;
  options.left = config.left;
  options.top = config.top;
  options.interlace = false;

  let lct = gct;
  if (config.lct) {
    lct = quatisation.extractColorTable(image.raw, config.lct);
    options.ctLength = lct.length;
    options.sorted = true;
  }

  const descriptor = Utils.imageDescriptor(options);
  push(descriptor, stream);
  if (config.lct) {
    push(lct.colors, stream);
  }
  const n = Utils.logByLog2(lct.length);
  encodeImage(image.raw, lct, n, stream);
};

/**
 *
 * @param {Object} config Global Configuration Object
 * @param {Object} config.canvas Canvas configuration
 * @param {Number} config.canvas.width width of canvas
 * @param {Number} config.canvas.height width of canvas
 * @param {Number} config.delay
 * The number of hundredths of a second to wait before moving on to the next scene.
 * @param {Number} config.disposalMethod 0, 1, 2 or 3
 * @param {ColorTableConfig} config.gct Global Color Table Configuration.
 * Should be set to null if there is no Global Color Table.
 * @param {Number} config.gct.index Index of image to extract GCT from.
 * The number of hundredths of a second to wait before moving on to the next scene.
 * @param {Array<{config: ImageConfig, raw: Array<Number>}>
 * } images Array Of Image Objects
 */
const process = (config, images) => {
  const delay = config.delay || 10;
  const disposalMethod = config.disposalMethod || 0;

  const lsd = {
    width: config.width,
    height: config.height,
  };
  let gct;
  if (config.gct) {
    const img = images[config.gct.index].image;
    gct = quatisation.extractColorTable(img, config.gct);
    lsd.ctLength = gct.length;
    lsd.sorted = true;
  }
  const gif = [...Utils.HEADER, ...Utils.logicalScreenDescriptor(lsd)];

  if (gct) {
    push(gct, gif);
  }
  if (images.length > 1) {
    push(Utils.loopBlock(), gif);
  }

  images.forEach((image) => {
    image.config ||= Object.create(null);
    image.config.delay ||= delay;
    image.config.disposalMethod ||= disposalMethod;
    image.config.left ||= 0;
    image.config.top ||= 0;
    image.config.width ||= config.canvas.width;
    image.config.height ||= config.canvas.height;
    processImage(gif, image);
  });

  gif.push(Utils.TRAILER);

  return gif;
};

/**
 * Packs an array of raw image objects into a gif image
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
  process,
};
