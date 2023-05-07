import { readFile } from '@ionic/utils-fs';
import xml2js from 'xml2js';

export async function readXML(path: string): Promise<any> {
  try {
    const xmlStr = await readFile(path, { encoding: 'utf-8' });
    try {
      return await xml2js.parseStringPromise(xmlStr);
    } catch (e: any) {
      throw `Error parsing: ${path}, ${e.stack ?? e}`;
    }
  } catch (e) {
    throw `Unable to read: ${path}`;
  }
}

export function parseXML(xmlStr: string, options?: xml2js.OptionsV2): any {
  const parser =
    options !== undefined
      ? new xml2js.Parser({ ...options })
      : new xml2js.Parser();
  let xmlObj;
  parser.parseString(xmlStr, (err: any, result: any) => {
    if (!err) {
      xmlObj = result;
    }
  });
  return xmlObj;
}

export async function writeXML(object: any): Promise<any> {
  return new Promise(resolve => {
    const builder = new xml2js.Builder({
      headless: true,
      explicitRoot: false,
      rootName: 'deleteme',
    });
    let xml = builder.buildObject(object);
    xml = xml.replace('<deleteme>', '').replace('</deleteme>', '');
    resolve(xml);
  });
}

export function buildXmlElement(configElement: any, rootName: string): string {
  const builder = new xml2js.Builder({
    headless: true,
    explicitRoot: false,
    rootName: rootName,
  });

  return builder.buildObject(configElement);
}
