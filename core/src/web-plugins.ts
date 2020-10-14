import { mergeWebPlugin } from './plugins';
import { Geolocation } from './web/geolocation';
import { LocalNotifications } from './web/local-notifications';
import { SplashScreen } from './web/splash-screen';

export * from './web/geolocation';
export * from './web/local-notifications';
export * from './web/splash-screen';

mergeWebPlugin(Geolocation);
mergeWebPlugin(LocalNotifications);
mergeWebPlugin(SplashScreen);
