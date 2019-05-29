import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

interface Hosting {
  hosting: {
    rules: {
      include: string;
      headers: {
        name: string;
        value: string;
      }[];
    }[];
  }
}

interface FirebaseConfig {
  hosting: {
    public: string,
    rewrites?: {
      source: string,
      destination: string
    }[];
    redirects?: {
      source: string,
      destination: string
    }[];
    headers?: {
      source: string;
      headers: {
        key: string;
        value: string;
      }[];
    }[];
  }
}

const HOSTCONFIG_SRC = './www/host.config.json';
const FIREBASE_SRC = './firebase-base.json';
const FIREBASE_DEST = './firebase.json';

(async function() {
  const hostDataSrc = await readFile(HOSTCONFIG_SRC, 'utf-8');
  const hostData: Hosting = JSON.parse(hostDataSrc);
  const firebaseDataSrc = await readFile(FIREBASE_SRC, 'utf-8');
  const firebaseData: FirebaseConfig = JSON.parse(firebaseDataSrc);
  
  const headerData = hostData.hosting.rules;
  
  const fireBaseHeaders = headerData.map(entry => {
    const headers = entry.headers.map(header => ({
      "key": header.name,
      "value": header.value 
    }));

    return {
      source: entry.include,
      headers
    };
  });
 
  const finalData: FirebaseConfig = {
    hosting: {
      ...firebaseData.hosting,
      headers: fireBaseHeaders
    }
  };
  await writeFile(FIREBASE_DEST, JSON.stringify(finalData, null, 2), { encoding: 'utf8' });
})();


