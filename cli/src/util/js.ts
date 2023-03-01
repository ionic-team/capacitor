import util from 'util';

export function formatJSObject(o: { [key: string]: any }): string {
  try {
    o = JSON.parse(JSON.stringify(o));
  } catch (e: any) {
    throw new Error(`Cannot parse object as JSON: ${e.stack ? e.stack : e}`);
  }

  return util.inspect(o, {
    compact: false,
    breakLength: Infinity,
    depth: Infinity,
    maxArrayLength: Infinity,
    maxStringLength: Infinity,
  });
}
