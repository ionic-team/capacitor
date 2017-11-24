#import <foundation/foundation.h>

#import "Plugins.h"

static NSMutableArray<Class> *AvocadoModuleClasses;
NSArray<Class> *AvocadoGetModuleClasses(void)
{
  return AvocadoModuleClasses;
}

void AvocadoRegisterModule(Class);
void AvocadoRegisterModule(Class moduleClass)
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    AvocadoModuleClasses = [NSMutableArray new];
  });

  // TODO: Make sure the class conforms to the protocol
  NSLog(@"Registering module %@", moduleClass);
  // Register module
  [AvocadoModuleClasses addObject:moduleClass];
}
