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

-(void)load {}

@end

