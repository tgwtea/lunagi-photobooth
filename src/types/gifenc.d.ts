declare module 'gifenc' {
  export type GIFEncoderInstance = {
    writeFrame(
      index: Uint8Array | number[],
      width: number,
      height: number,
      opts?: {
        palette?: number[][];
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        dispose?: number;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  };

  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): GIFEncoderInstance;
  export function quantize(data: Uint8ClampedArray | Uint8Array, maxColors: number): number[][];
  export function applyPalette(data: Uint8ClampedArray | Uint8Array, palette: number[][]): Uint8Array;
}
