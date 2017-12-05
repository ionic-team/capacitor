import { runTask } from '../../common';
import { cp } from 'shelljs';


export async function copyIOS() {

  await runTask('Copying www -> ios/www', async () => {
    const dest = 'ios/';
    cp('-R', 'www', dest);
  });

}
