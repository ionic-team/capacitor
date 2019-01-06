/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "Keyboard.h"
#import "CAPBridgedPlugin.h"
#import <Foundation/Foundation.h>
#import <objc/runtime.h>
#import <Capacitor/Capacitor-Swift.h>

typedef enum : NSUInteger {
  ResizeNone,
  ResizeNative,
  ResizeBody,
  ResizeIonic,
} ResizePolicy;


@interface CAPKeyboard () <UIScrollViewDelegate>

@property (nonatomic, readwrite, assign) BOOL keyboardIsVisible;
@property (nonatomic, readwrite) ResizePolicy keyboardResizes;
@property (nonatomic, readwrite) int paddingBottom;

@end

@implementation CAPKeyboard

- (void)load
{
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(statusBarDidChangeFrame:) name:UIApplicationDidChangeStatusBarFrameNotification object: nil];
  NSString * style = [self getConfigValue:@"style"];
  if ([style isEqualToString:@"dark"]) {
    [self setKeyboardAppearanceDark];
  }
  
  self.keyboardResizes = ResizeNative;
  BOOL doesResize = YES;
  if (!doesResize) {
    self.keyboardResizes = ResizeNone;
    NSLog(@"CAPIonicKeyboard: no resize");
    
  } else {
    NSString *resizeMode = @"ionic";
    if (resizeMode) {
      if ([resizeMode isEqualToString:@"ionic"]) {
        self.keyboardResizes = ResizeIonic;
      } else if ([resizeMode isEqualToString:@"body"]) {
        self.keyboardResizes = ResizeBody;
      }
    }
    // NSLog(@"CAPIonicKeyboard: resize mode %d", self.keyboardResizes);
  }
  self.hideFormAccessoryBar = YES;
  
  NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
  
  [nc addObserver:self selector:@selector(onKeyboardDidHide:) name:UIKeyboardDidHideNotification object:nil];
  [nc addObserver:self selector:@selector(onKeyboardDidShow:) name:UIKeyboardDidShowNotification object:nil];
  [nc addObserver:self selector:@selector(onKeyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
  [nc addObserver:self selector:@selector(onKeyboardWillShow:) name:UIKeyboardWillShowNotification object:nil];
  
  [nc removeObserver:self.webView name:UIKeyboardWillChangeFrameNotification object:nil];
  [nc removeObserver:self.webView name:UIKeyboardDidChangeFrameNotification object:nil];
}


#pragma mark Keyboard events

-(void)statusBarDidChangeFrame:(NSNotification*)notification {
  [self _updateFrame];
}

- (void)resetScrollView
{
  UIScrollView *scrollView = [self.webView scrollView];
  [scrollView setContentInset:UIEdgeInsetsZero];
}

- (void)onKeyboardWillHide:(NSNotification *)sender
{
  [self setKeyboardHeight:0 delay:0.01];
  [self resetScrollView];
  [self.bridge triggerWindowJSEventWithEventName:@"keyboardWillHide"];
}

- (void)onKeyboardWillShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  double duration = [[note.userInfo valueForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  [self setKeyboardHeight:height delay:duration/2.0];
  [self resetScrollView];
  
  NSString * data = [NSString stringWithFormat:@"{ 'keyboardHeight': %d }", (int)height];
  [self.bridge triggerWindowJSEventWithEventName:@"keyboardWillShow" data:data];
}

- (void)onKeyboardDidShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  [self resetScrollView];
  
  NSString * data = [NSString stringWithFormat:@"{ 'keyboardHeight': %d }", (int)height];
  [self.bridge triggerWindowJSEventWithEventName:@"keyboardDidShow" data:data];
}

- (void)onKeyboardDidHide:(NSNotification *)sender
{
  [self.bridge triggerWindowJSEventWithEventName:@"keyboardDidHide"];
  [self resetScrollView];
}

- (void)setKeyboardHeight:(int)height delay:(NSTimeInterval)delay
{
  if (self.keyboardResizes != ResizeNone) {
    [self setPaddingBottom: height delay:delay];
  }
}

- (void)setPaddingBottom:(int)paddingBottom delay:(NSTimeInterval)delay
{
  if (self.paddingBottom == paddingBottom) {
    return;
  }
  
  self.paddingBottom = paddingBottom;
  
  __weak CAPKeyboard* weakSelf = self;
  SEL action = @selector(_updateFrame);
  [NSObject cancelPreviousPerformRequestsWithTarget:weakSelf selector:action object:nil];
  if (delay == 0) {
    [self _updateFrame];
  } else {
    [weakSelf performSelector:action withObject:nil afterDelay:delay];
  }
}

- (void)_updateFrame
{
  CGSize statusBarSize = [[UIApplication sharedApplication] statusBarFrame].size;
  int statusBarHeight = MIN(statusBarSize.width, statusBarSize.height);
  
  int _paddingBottom = (int)self.paddingBottom;
  
  if (statusBarHeight == 40) {
    _paddingBottom = _paddingBottom + 20;
  }
  CGRect f = [[UIScreen mainScreen] bounds];
  CGRect wf = self.webView.frame;
  switch (self.keyboardResizes) {
    case ResizeBody:
    {
      NSString *js = [NSString stringWithFormat:@"plugin.fireOnResize(%d, %d, document.body);",
                      _paddingBottom, (int)f.size.height];
      [self.bridge evalWithPlugin:self js:js];
      break;
    }
    case ResizeIonic:
    {
      NSString *js = [NSString stringWithFormat:@"plugin.fireOnResize(%d, %d, document.querySelector('ion-app'));",
                      _paddingBottom, (int)f.size.height];
      [self.bridge evalWithPlugin:self js:js];
      break;
    }
    case ResizeNative:
    {
      [self.webView setFrame:CGRectMake(wf.origin.x, wf.origin.y, f.size.width - wf.origin.x, f.size.height - wf.origin.y - self.paddingBottom)];
      break;
    }
    default:
      break;
  }
  [self resetScrollView];
}


#pragma mark HideFormAccessoryBar

static IMP UIOriginalImp;
static IMP WKOriginalImp;

- (void)setHideFormAccessoryBar:(BOOL)hideFormAccessoryBar
{
  if (hideFormAccessoryBar == _hideFormAccessoryBar) {
    return;
  }
  
  NSString* UIClassString = [@[@"UI", @"Web", @"Browser", @"View"] componentsJoinedByString:@""];
  NSString* WKClassString = [@[@"WK", @"Content", @"View"] componentsJoinedByString:@""];
  
  Method UIMethod = class_getInstanceMethod(NSClassFromString(UIClassString), @selector(inputAccessoryView));
  Method WKMethod = class_getInstanceMethod(NSClassFromString(WKClassString), @selector(inputAccessoryView));
  
  if (hideFormAccessoryBar) {
    UIOriginalImp = method_getImplementation(UIMethod);
    WKOriginalImp = method_getImplementation(WKMethod);
    
    IMP newImp = imp_implementationWithBlock(^(id _s) {
      return nil;
    });
    
    method_setImplementation(UIMethod, newImp);
    method_setImplementation(WKMethod, newImp);
  } else {
    method_setImplementation(UIMethod, UIOriginalImp);
    method_setImplementation(WKMethod, WKOriginalImp);
  }
  
  _hideFormAccessoryBar = hideFormAccessoryBar;
}


#pragma mark Plugin interface

- (void)setAccessoryBarVisible:(CAPPluginCall *)call
{
  BOOL value = [self getBool:call field:@"isVisible" defaultValue:FALSE];

  NSLog(@"Accessory bar visible change %d", value);
  self.hideFormAccessoryBar = !value;
  [call successHandler];
}

- (void)hide:(CAPPluginCall *)call
{
  [self.webView endEditing:YES];
}

- (void)show:(CAPPluginCall *)call
{
  [call successHandler];
}

- (void)setKeyboardAppearanceDark
{
  IMP darkImp = imp_implementationWithBlock(^(id _s) {
    return UIKeyboardAppearanceDark;
  });
  for (NSString* classString in @[@"WKContentView", @"UITextInputTraits"]) {
    Class c = NSClassFromString(classString);
    Method m = class_getInstanceMethod(c, @selector(keyboardAppearance));
    if (m != NULL) {
      method_setImplementation(m, darkImp);
    } else {
      class_addMethod(c, @selector(keyboardAppearance), darkImp, "l@:");
    }
  }
}

#pragma mark dealloc

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end


