import zlib from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

export class CompressionUtil {
  /**
   * Compresses a Buffer (e.g. raw PDF or image receipt) using Gzip compression.
   */
  static async compressBuffer(buffer: Buffer): Promise<Buffer> {
    return await gzipAsync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION });
  }

  /**
   * Decompresses a Gzip-compressed Buffer back to its original state.
   */
  static async decompressBuffer(compressedBuffer: Buffer): Promise<Buffer> {
    return await gunzipAsync(compressedBuffer);
  }
}
