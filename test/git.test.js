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
      const enc = [
        0x8C, 0x2D, 0x99, 0x87, 0x2A, 0x1C, 0xDC, 0x33, 0xA0, 0x02, 0x75, 0xEC,
        0x95, 0xFA, 0xA8, 0xDE, 0x60, 0x8C, 0x04, 0x91, 0x4C, 0x01,
      ];
      expect(gif.encode(samples.RAW_SQUARE_IMAGE, ct, 2)).toStrictEqual(enc);
    });
  });
});
