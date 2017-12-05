import { runTask } from '../../common';
import { cp } from 'shelljs';


export async function copyAndroid() {

  await runTask('Copying www -> android/www', async () => {
    const dest = 'android/';
    cp('-R', 'www', dest);
  });

}
