import { mergeWebPlugin } from './plugins';
import { App } from './web/app';
import { LocalNotifications } from './web/local-notifications';
import { Modals } from './web/modals';
import { SplashScreen } from './web/splash-screen';

export * from './web/app';
export * from './web/local-notifications';
export * from './web/modals';
export * from './web/splash-screen';

mergeWebPlugin(App);
mergeWebPlugin(LocalNotifications);
mergeWebPlugin(Modals);
mergeWebPlugin(SplashScreen);
