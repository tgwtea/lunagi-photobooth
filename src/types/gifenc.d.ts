declare module 'gifenc' {
  export class GIFEncoder {
    constructor();
    writeHeader(): void;
    addFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: number[][];
        delay?: number;
        [key: string]: any;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: any
  ): number[][];

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string
  ): Uint8Array;
}
