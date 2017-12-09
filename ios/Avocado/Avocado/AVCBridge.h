#import <UIKit/UIKit.h>

@interface AVCBridge : NSObject

@property (strong, nonatomic) UIViewController* viewController;

- (id) init;
- (void) evaluateJS:(NSString *)js;

@end


