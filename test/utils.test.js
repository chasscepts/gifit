import { describe, expect, it } from '@jest/globals';
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

  describe('toBits', () => {
    it('throws Error when number is less than 0', () => {
      expect(() => Utils.toBits(-1)).toThrow();
    });

    it('throws Error when number is greater than 255', () => {
      expect(() => Utils.toBits(256)).toThrow();
    });

    it('correctly converts 0', () => {
      const { bits } = Utils.toBits(0);
      expect(
        bits[0] || bits[1] || bits[2] || bits[3] || bits[4] || bits[5] || bits[6] || bits[7],
      ).toBe(false);
    });

    it('correctly converts 255', () => {
      const { bits } = Utils.toBits(255);
      expect(
        bits[0] && bits[1] && bits[2] && bits[3] && bits[4] && bits[5] && bits[6] && bits[7],
      ).toBe(true);
    });

    it('correctly converts 170', () => {
      const { bits } = Utils.toBits(170);
      expect(bits[0] && bits[2] && bits[4] && bits[6]).toBe(true);
      expect(bits[1] || bits[3] || bits[5] || bits[7]).toBe(false);
    });

    it('isset and bits both return the same thing', () => {
      const { bits, isset } = Utils.toBits(170);
      expect(
        bits[0] === isset(0)
        && bits[1] === isset(1)
        && bits[2] === isset(2)
        && bits[3] === isset(3)
        && bits[4] === isset(4)
        && bits[5] === isset(5)
        && bits[6] === isset(6)
        && bits[7] === isset(7),
      ).toBe(true);
    });
  });

  describe('fromBits', () => {
    it('correctly converts 0', () => {
      expect(Utils.fromBits([0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
    });

    it('correctly converts 255', () => {
      expect(Utils.fromBits([1, 1, 1, 1, 1, 1, 1, 1])).toBe(255);
    });

    it('correctly converts 170', () => {
      expect(Utils.fromBits([1, 0, 1, 0, 1, 0, 1, 0])).toBe(170);
    });
  });

  describe('toBinary', () => {
    it('correctly converts 0', () => {
      expect(Utils.toBinary(0, 4)).toStrictEqual([0, 0, 0, 0]);
    });

    it('correctly converts 7', () => {
      expect(Utils.toBinary(7, 3)).toStrictEqual([1, 1, 1]);
    });
  });

  describe('byteLength', () => {
    it('throws error when length is not power of 2', () => {
      expect(() => Utils.byteLength(7)).toThrow();
    });

    it('correctly converts 4', () => {
      expect(Utils.byteLength(4)).toStrictEqual([0, 0, 1]);
    });

    it('correctly converts 256', () => {
      expect(Utils.byteLength(256)).toStrictEqual([1, 1, 1]);
    });
  });

  describe('logicalScreenDescriptor', () => {
    it('correctly evaluates a sample image', () => {
      const options = {
        width: 10, height: 10, resolution: 2, sorted: false, ctLength: 4,
      };
      expect(
        Utils.logicalScreenDescriptor(options),
      ).toStrictEqual([0x0A, 0x00, 0x0A, 0x00, 0x91, 0x00, 0x00]);
    });
  });
});
