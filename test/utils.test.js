import { expect, it } from '@jest/globals';
import Utils from '../src/lib/utils';

describe('Utils', () => {
  describe('lsb', () => {
    it('correctly converts 0', () => {
      expect(Utils.lsb(0)).toStrictEqual([0, 0]);
    });

    it('correctly converts 255', () => {
      expect(Utils.lsb(255)).toStrictEqual([0xFF, 0]);
    });

    it('correctly converts 256', () => {
      expect(Utils.lsb(256)).toStrictEqual([0, 1]);
    });
  });
});
