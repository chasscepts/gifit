/**
 * RGB color format
 * @param {Number} r red component of color
 * @param {Number} g green component of color
 * @param {Number} b blue component of color
 * @returns
 */
const RGB = (r, g, b) => {
  /**
   * compares this color with another color
   * @param {RGB} rgb color to compare with
   * @returns -1 if this color is less than other color,
   * 1 if this color is greater than other color, 0 otherwise.
   */
  const compare = (rgb) => {
    if (r < rgb.r) return -1;
    if (r > rgb.r) return 1;
    if (g < rgb.g) return -1;
    if (g > rgb.g) return 1;
    if (b < rgb.b) return -1;
    if (b > rgb.b) return 1;
    return 0;
  };

  return {
    r,
    g,
    b,
    compare,
  };
};

/**
 *
 * @param {Array<Number} colors array representation of the colors.
 * Each sequence of 3 numbers denotes the rgb components of a color
 * @returns
 */
const colorUtils = (colors) => {
  const wrappers = [];
  let idx = 0;
  for (let i = 0, n = colors.length; i < n; i += 3) {
    if (i + 2 >= n) break;
    const wrapper = Object.create(null);
    wrapper.color = RGB(colors[i], colors[i + 1], colors[i + 2]);
    wrapper.index = idx;
    idx += 1;
    wrappers.push(wrapper);
  }
  wrappers.sort((a, b) => a.color.compare(b.color));

  /**
   *
   * @param {Array<RGB>} colors
   * @param {RGB} rgb
   * @returns
   */
  const binarySearch = (rgb, start, end) => {
    if (end < start) {
      return -1;
    }
    if (start === end) {
      const cmp = rgb.compare(wrappers[start].color);
      return cmp === 0 ? wrappers[start].index : -1;
    }
    const mid = Math.floor((start + end) / 2);
    const cmp = rgb.compare(wrappers[mid].color);
    if (cmp === 0) {
      return wrappers[mid].index;
    }
    if (cmp < 0) return binarySearch(rgb, 0, mid - 1);
    return binarySearch(rgb, mid + 1, end);
  };

  return {
    indexOf: (...args) => {
      const rgb = args.length === 1 ? args[0] : RGB(args[0], args[1], args[2]);
      return binarySearch(rgb, 0, wrappers.length - 1);
    },
  };
};

export default {
  RGB,
  colorUtils,
};
