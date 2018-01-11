#import <foundation/foundation.h>
#import <Capacitor/Capacitor-Swift.h>

static NSMutableArray<Class> *CapacitorPluginClasses;
NSArray<Class> *CapacitorGetPluginClasses(void)
{
  return CapacitorPluginClasses;
}

void CapacitorRegisterPlugin(Class);
void CapacitorRegisterPlugin(Class PluginClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    CapacitorPluginClasses = [NSMutableArray new];
  });

  // TODO: Make sure the class conforms to the protocol
  NSLog(@"Registering Plugin %@", PluginClass);
  // Register Plugin
  [CapacitorPluginClasses addObject:PluginClass];
}

