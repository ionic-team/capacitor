#import <UIKit/UIKit.h>
#import "AVCPlugin.h"

@interface AVCKeyboard : AVCPlugin

@property (readwrite, assign, nonatomic) BOOL shrinkView;
@property (readwrite, assign, nonatomic) BOOL disableScrollingInShrinkView;
@property (readwrite, assign, nonatomic) BOOL hideFormAccessoryBar;
@property (readonly, assign, nonatomic) BOOL keyboardIsVisible;

- (void)hideFormAccessoryBar:(AVCPluginCall*)command;
- (void)hide:(AVCPluginCall*)command;

@end
