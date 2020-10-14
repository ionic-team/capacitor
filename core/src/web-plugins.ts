import { mergeWebPlugin } from './plugins';
import { App } from './web/app';
import { LocalNotifications } from './web/local-notifications';
import { SplashScreen } from './web/splash-screen';

export * from './web/app';
export * from './web/local-notifications';
export * from './web/splash-screen';

mergeWebPlugin(App);
mergeWebPlugin(LocalNotifications);
mergeWebPlugin(SplashScreen);
