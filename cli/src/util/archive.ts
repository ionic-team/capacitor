import * as tarType from 'tar';

export type TarExtractOptions = tarType.ExtractOptions & tarType.FileOptions;

export async function createTarExtraction(opts?: TarExtractOptions): Promise<NodeJS.WritableStream> {
  const tar = await import('tar');
  return tar.extract(opts || {});
}
