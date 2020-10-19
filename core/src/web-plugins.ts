import { mergeWebPlugin } from './plugins';
import { LocalNotifications } from './web/local-notifications';
import { SplashScreen } from './web/splash-screen';

export * from './web/local-notifications';
export * from './web/splash-screen';

mergeWebPlugin(LocalNotifications);
mergeWebPlugin(SplashScreen);
