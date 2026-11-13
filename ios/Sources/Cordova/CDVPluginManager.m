#import "CDVPluginManager.h"
#import "CDVPlugin.h"
#import "CDVCommandDelegateImpl.h"

@implementation CDVPluginManager

- (id)initWithParser:(CDVConfigParser*)parser viewController:(UIViewController*)viewController webView:(WKWebView *)webview
{
  self = [super init];
  if (self != nil) {
    _pluginsMap = parser.pluginsDict;
    _settings = parser.settings;
    _viewController = viewController;
    _webView = webview;
    _pluginObjects = [[NSMutableDictionary alloc] init];
    _commandDelegate = [[CDVCommandDelegateImpl alloc] initWithWebView:_webView pluginManager:self];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppDidEnterBackground:)
                                                 name:UIApplicationDidEnterBackgroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppWillEnterForeground:)
                                                 name:UIApplicationWillEnterForegroundNotification object:nil];
  }
  return self;
}

/**
 Returns an instance of a CordovaCommand object, based on its name.  If one exists already, it is returned.
 */
- (CDVPlugin *)getCommandInstance:(NSString*)pluginName
{
  NSString* className = [self.pluginsMap objectForKey:[pluginName lowercaseString]];

  if (className == nil) {
    return nil;
  }

  id obj = [self.pluginObjects objectForKey:className];
  if (!obj) {
    obj = [[NSClassFromString(className)alloc] initWithWebViewEngine: self.webView];
    if (!obj) {
      NSString* fullClassName = [NSString stringWithFormat:@"%@.%@",
                                 NSBundle.mainBundle.infoDictionary[@"CFBundleExecutable"],
                                 className];
      obj = [[NSClassFromString(fullClassName)alloc] initWithWebViewEngine: self.webView];
    }

    if (obj != nil) {
      [self registerPlugin:obj withClassName:className];
    } else {
      NSLog(@"CDVPlugin class %@ (pluginName: %@) does not exist.", className, pluginName);
    }
  }
  [obj setClassName:className];

  return obj;
}


- (void)registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className
{
  [self.pluginObjects setObject:plugin forKey:className];
  plugin.viewController = self.viewController;
  plugin.webView = self.webView;
  plugin.commandDelegate = self.commandDelegate;
  [plugin pluginInitialize];
}

- (void)onAppDidEnterBackground:(NSNotification*)notification
{
  [self.commandDelegate evalJsHelper2:@"window.Capacitor.triggerEvent('pause', 'document');"];
}

- (void)onAppWillEnterForeground:(NSNotification*)notification
{
  [self.commandDelegate evalJsHelper2:@"window.Capacitor.triggerEvent('resume', 'document');"];
}

@end
