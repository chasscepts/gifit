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

  describe('gce', () => {
    it('return correct value for sample NON animated image', () => {
      const options = {
        delay: 0,
        transparentColorIndex: 0,
        transparentColorFlag: false,
        disposalMethod: Utils.DISPOSAL_METHODS.NOT_SPECIFIED,
        userInput: false,
      };
      expect(Utils.gce(options)).toStrictEqual([
        0x21, 0xF9, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
      ]);
    });

    it('return correct value for sample animated image', () => {
      const options = {
        delay: 100,
        transparentColorFlag: false,
        disposalMethod: Utils.DISPOSAL_METHODS.DO_NOT_DISPOSE,
        userInput: false,
      };
      expect(Utils.gce(options)).toStrictEqual([
        0x21, 0xF9, 0x04, 0x04, 0x64, 0x00, 0x00, 0x00,
      ]);
    });
  });

  describe('loopBlock', () => {
    it('correctly evaluates a sample image', () => {
      expect(
        Utils.loopBlock({ loopTimes: 0 }),
      ).toStrictEqual([
        0x21, 0xFF, 0x0B, 0x4E, 0x45, 0x54, 0x53, 0x43, 0x41,
        0x50, 0x45, 0x32, 0x2E, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00,
      ]);
    });
  });

  describe('imageDescriptor', () => {
    it('correctly evaluates a sample image with (left, top) = (0, 0)', () => {
      const options = {
        left: 0, top: 0, width: 10, height: 10, interlace: false, sorted: false, lctLength: 0,
      };
      expect(
        Utils.imageDescriptor(options),
      ).toStrictEqual([
        0x2C, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x00, 0x0A, 0x00, 0x00,
      ]);
    });

    it('correctly evaluates a sample image with (left, top) = (0, 0)', () => {
      const options = {
        left: 2, top: 11, width: 7, height: 16, interlace: false, sorted: false, lctLength: 0,
      };
      expect(
        Utils.imageDescriptor(options),
      ).toStrictEqual([
        0x2C, 0x02, 0x00, 0x0B, 0x00, 0x07, 0x00, 0x10, 0x00, 0x00,
      ]);
    });
  });

  describe('normalizeColorTable', () => {
    const randomByte = () => Math.floor(256 * Math.random());
    it('returns appropriate values when table length is a perfect square of 2', () => {
      const n = 4;
      const length = 3 * 2 ** (n + 1);
      const ct = [...Array(length)].map(() => randomByte());
      const normalized = Utils.normalizeColorTable(ct);
      expect(normalized.ct).toStrictEqual(ct);
      expect(normalized.N).toStrictEqual(n);
    });

    it('fill up color table when length is not a perfect square of 2', () => {
      const n = 4;
      const nextN = 5;
      const extraLength = 10;
      const length = 3 * 2 ** (n + 1) + extraLength;
      const ct = [...Array(length)].map(() => randomByte());
      const ctl = [...ct];
      [...Array(3 * 2 ** (nextN + 1) - length)].forEach(() => ctl.push(0));
      const normalized = Utils.normalizeColorTable(ct);
      expect(normalized.ct).toStrictEqual(ctl);
      expect(normalized.N).toStrictEqual(nextN);
    });

    it('truncates color table when length is greater than 256', () => {
      const n = 7;
      const extraLength = 30;
      const length = 3 * 2 ** (n + 1);
      const ctl = [...Array(length)].map(() => randomByte());
      const ct = [...ctl];
      [...Array(length + extraLength)].forEach(() => ct.push(0));
      const normalized = Utils.normalizeColorTable(ct);
      expect(normalized.ct).toStrictEqual(ctl);
      expect(normalized.N).toStrictEqual(n);
    });
  });

  describe('initCodeTable', () => {
    it('correctly initializes code table when minimum codeSize is 2', () => {
      expect(Utils.initCodeTable(2)).toStrictEqual(
        ['0', '1', '2', '3', '4', '5'],
      );
    });

    it('correctly initializes code table when minimum codeSize is 8', () => {
      const codeTable = [];
      for (let i = 0; i <= 257; i += 1) {
        codeTable.push(`${i}`);
      }
      expect(Utils.initCodeTable(8)).toStrictEqual(codeTable);
    });
  });

  describe('BitStream', () => {
    it('correctly transcode a single number', () => {
      const stream = Utils.bitStream();
      stream.push(4, 3);
      stream.flush();
      expect(stream.toArray()).toStrictEqual([4]);
    });

    it('correctly transcodes a sequence of random numbers at bit size 8', () => {
      const rand = () => Math.floor(256 * Math.random());
      const times = rand();
      const stream = Utils.bitStream();
      const expected = Array(times);
      Utils.loop(times, (i) => {
        const number = rand();
        expected[i] = number;
        stream.push(number, 8);
      });
      stream.flush();
      expect(stream.toArray()).toStrictEqual(expected);
    });

    it('correctly transcodes a sample sequence of numbers written at different sizes', () => {
      const stream = Utils.bitStream();
      [
        { number: 4, size: 3 },
        { number: 8, size: 4 },
        { number: 17, size: 5 },
        { number: 0, size: 3 },
        { number: 9, size: 4 },
        { number: 11, size: 4 },
        { number: 2, size: 3 },
      ].forEach((sample) => stream.push(sample.number, sample.size));
      stream.flush();
      expect(stream.toArray()).toStrictEqual([196, 136, 92, 1]);
    });
  });
});
