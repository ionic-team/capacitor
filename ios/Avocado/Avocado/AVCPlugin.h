#import <Foundation/Foundation.h>
#import "AVCBridge.h"

@class Bridge;

@interface AVCPlugin : NSObject

@property (nonatomic, strong) NSString* pluginId;
@property (nonatomic, strong) Bridge* bridge;

-(instancetype) initWithBridge:(Bridge*) bridge pluginId:(NSString*) pluginId;

@end

@interface AVCPluginCall : NSObject
@end
