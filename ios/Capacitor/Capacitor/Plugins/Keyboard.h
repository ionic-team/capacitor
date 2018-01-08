#import <UIKit/UIKit.h>
#import "CAPPlugin.h"
#import "CAPBridgedPlugin.h"


@class CAPPluginCall;

@interface CAPKeyboard : CAPPlugin <CAPBridgedPlugin>

@property (readwrite, assign, nonatomic) BOOL shrinkView;
@property (readwrite, assign, nonatomic) BOOL disableScrollingInShrinkView;
@property (readwrite, assign, nonatomic) BOOL hideFormAccessoryBar;
@property (readonly, assign, nonatomic) BOOL keyboardIsVisible;

- (void)setAccessoryBarVisible:(CAPPluginCall*)command;
- (void)hide:(CAPPluginCall*)command;

@end

