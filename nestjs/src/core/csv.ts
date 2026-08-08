import { StreamableFile } from '@nestjs/common';

/**
 * Wraps CSV text in a StreamableFile with the same headers the legacy
 * @Res()-based handlers wrote manually. Disposition strings vary per endpoint
 * (some quote the filename, one adds `attachment;`) and are preserved
 * byte-exact by the callers.
 */
export function toCsvFile(csv: string, disposition: string): StreamableFile {
  const buffer = Buffer.from(csv);
  return new StreamableFile(buffer, { type: 'text/csv', disposition, length: buffer.length });
}
