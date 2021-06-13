import { describe, expect, it } from '@jest/globals';
import gif from '../src/lib/gif';
import samples from './helpers/samples';

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
});
