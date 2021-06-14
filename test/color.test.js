import { describe, expect, it } from '@jest/globals';
import color from '../src/lib/color';

const colors = [
  0, 0, 0, // 0
  255, 0, 0, // 1
  0, 255, 0, // 2
  0, 0, 255, // 3
  255, 255, 0, // 4
  255, 0, 255, // 5
  0, 255, 255, // 6
  255, 255, 255, // 7
  122, 212, 200, // 8
  0, 36, 100, // 9
  5, 6, 7, // 10
];

const colorUtils = color.colorUtils(colors);

describe('indexOf', () => {
  it('returns the index of first item', () => {
    expect(colorUtils.indexOf(color.RGB(colors[0], colors[1], colors[2]))).toBe(0);
  });

  it('returns the index of last item', () => {
    expect(colorUtils.indexOf(color.RGB(colors[30], colors[31], colors[32]))).toBe(10);
  });

  it('returns the index of a random item', () => {
    let start = Math.floor(colors.length * Math.random());
    const index = Math.floor(start / 3);
    start = index * 3;
    expect(
      colorUtils.indexOf(color.RGB(colors[start], colors[start + 1], colors[start + 2])),
    ).toBe(index);
  });

  it('returns the index when color components are passed in', () => {
    let start = Math.floor(colors.length * Math.random());
    const index = Math.floor(start / 3);
    start = index * 3;
    expect(
      colorUtils.indexOf(colors[start], colors[start + 1], colors[start + 2]),
    ).toBe(index);
  });

  it('returns -1 when color is not in colors', () => {
    expect(colorUtils.indexOf(color.RGB(8, 15, 27))).toBe(-1);
  });
});
