import { askPlatform } from "../common";
import { doctorIOS } from "../platforms/ios/doctor";


export async function doctorCommand(platform: string) {
  const finalPlatform = await askPlatform(platform);
  await doctor(finalPlatform);
}

export async function doctor(platform: string) {
  if (platform === 'ios') {
    await doctorIOS();
  }
}

