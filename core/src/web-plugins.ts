import { mergeWebPlugin } from './plugins';
import { SplashScreen } from './web/splash-screen';

export * from './web/splash-screen';

mergeWebPlugin(SplashScreen);
