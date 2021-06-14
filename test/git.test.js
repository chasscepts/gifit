import { describe, expect, it } from '@jest/globals';
import gif from '../src/lib/gif';
import samples from './helpers/samples';
import color from '../src/lib/color';

describe('gif', () => {
  describe('pack', () => {
    it('correctly packs a NON animated image', () => {
      const sample = samples.SQUARE_IMAGE;
      expect(
        gif.pack(sample.lsd, sample.gct, sample.loopBlock, sample.images),
      ).toStrictEqual(sample.data);
    });

    it('correctly packs an animated image', () => {
      const sample = samples.TRAFFICLIGHT;
      expect(
        gif.pack(sample.lsd, sample.gct, sample.loopBlock, sample.images),
      ).toStrictEqual(sample.data);
    });
  });

  describe('encode', () => {
    it('correctly encodes a sample image', () => {
      const ct = color.colorUtils([
        0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00,
      ]);
      expect(gif.encode(samples.RAW_SQUARE_IMAGE, ct)).toStrictEqual([
        4, 1, 6, 6, 2, 9, 9, 7, 8, 10, 2, 12, 1, 14, 15, 6, 0, 21, 0, 10, 7, 22, 23,
        18, 26, 7, 10, 29, 13, 24, 12, 18, 16, 36, 12, 5,
      ]);
    });
  });
});
