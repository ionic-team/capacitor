#import "CDVPluginManager.h"
#import "CDVPlugin.h"

@implementation CDVPluginManager

- (id)initWithMapping:(NSMutableDictionary*)mapping
{
  self = [super init];
  if (self != nil) {
    _pluginsMap = mapping;
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
    obj = [[NSClassFromString(className)alloc] init];
    if (!obj) {
      NSString* fullClassName = [NSString stringWithFormat:@"%@.%@",
                                 NSBundle.mainBundle.infoDictionary[@"CFBundleExecutable"],
                                 className];
      obj = [[NSClassFromString(fullClassName)alloc] init];
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
  [plugin pluginInitialize];
}

@end
