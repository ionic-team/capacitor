#import <UIKit/UIKit.h>
#import "AVCPlugin.h"
#import "PluginBridge.h"

@class PluginCall;

@interface AVCKeyboard : AVCPlugin <AvocadoBridgePlugin>

@property (readwrite, assign, nonatomic) BOOL shrinkView;
@property (readwrite, assign, nonatomic) BOOL disableScrollingInShrinkView;
@property (readwrite, assign, nonatomic) BOOL hideFormAccessoryBar;
@property (readonly, assign, nonatomic) BOOL keyboardIsVisible;

- (void)setAccessoryBarVisible:(PluginCall*)command;
- (void)hide:(PluginCall*)command;

@end
