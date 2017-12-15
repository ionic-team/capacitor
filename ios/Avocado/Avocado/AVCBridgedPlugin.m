#import <foundation/foundation.h>
#import <Avocado/Avocado-Swift.h>

static NSMutableArray<Class> *AvocadoPluginClasses;
NSArray<Class> *AvocadoGetPluginClasses(void)
{
  return AvocadoPluginClasses;
}

void AvocadoRegisterPlugin(Class);
void AvocadoRegisterPlugin(Class PluginClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    AvocadoPluginClasses = [NSMutableArray new];
  });

  // TODO: Make sure the class conforms to the protocol
  NSLog(@"Registering Plugin %@", PluginClass);
  // Register Plugin
  [AvocadoPluginClasses addObject:PluginClass];
}

