#import "AVCPlugin.h"
#import <Avocado/Avocado-Swift.h>

#import <Foundation/Foundation.h>

@implementation AVCPlugin

-(instancetype) initWithBridge:(Bridge *)bridge pluginId:(NSString *)pluginId {
  self.bridge = bridge;
  self.pluginId = pluginId;
  return self;
}

-(NSString *) getId {
  return self.pluginId;
}

-(BOOL) getBool:(PluginCall *)call field:(NSString *)field defaultValue:(BOOL)defaultValue {
  NSNumber *value = [call getBool:field defaultValue:nil];
  if(value == nil) {
    return defaultValue;
  }
  if(value.integerValue == 0) {
    return FALSE;
  }
  return TRUE;
}

-(void)load {}

@end

