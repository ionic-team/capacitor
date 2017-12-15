#import <UIKit/UIKit.h>
#import "AVCPlugin.h"
#import "AVCBridgedPlugin.h"


@class AVCPluginCall;

@interface AVCKeyboard : AVCPlugin <AVCBridgedPlugin>

@property (readwrite, assign, nonatomic) BOOL shrinkView;
@property (readwrite, assign, nonatomic) BOOL disableScrollingInShrinkView;
@property (readwrite, assign, nonatomic) BOOL hideFormAccessoryBar;
@property (readonly, assign, nonatomic) BOOL keyboardIsVisible;

- (void)setAccessoryBarVisible:(AVCPluginCall*)command;
- (void)hide:(AVCPluginCall*)command;

@end

