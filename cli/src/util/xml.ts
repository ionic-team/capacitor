import { readFile } from '@ionic/utils-fs';
import xml2js from 'xml2js';

export async function readXML(path: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const xmlStr = await readFile(path, { encoding: 'utf-8' });
      xml2js.parseString(xmlStr, (e, result) => {
        if (e) {
          reject(`Error parsing: ${path}, ${e.stack ?? e}`);
        } else {
          resolve(result);
        }
      });
    } catch (e) {
      throw `Unable to read: ${path}`;
    }
  });
}

export function parseXML(xmlStr: string): any {
  let xmlObj;
  xml2js.parseString(xmlStr, (err: any, result: any) => {
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
