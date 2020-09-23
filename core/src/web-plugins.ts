import { mergeWebPlugin } from './plugins';
import { App } from './web/app';
import { Camera } from './web/camera';
import { Geolocation } from './web/geolocation';
import { LocalNotifications } from './web/local-notifications';
import { Modals } from './web/modals';
import { SplashScreen } from './web/splash-screen';

export * from './web/app';
export * from './web/camera';
export * from './web/geolocation';
export * from './web/local-notifications';
export * from './web/modals';
export * from './web/splash-screen';

mergeWebPlugin(App);
mergeWebPlugin(Camera);
mergeWebPlugin(Geolocation);
mergeWebPlugin(LocalNotifications);
mergeWebPlugin(Modals);
mergeWebPlugin(SplashScreen);
