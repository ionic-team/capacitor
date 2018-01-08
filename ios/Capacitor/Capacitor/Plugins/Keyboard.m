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

// Define the plugin
//AVOCADO_EXPORT_PLUGIN("com.avocadojs.plugin.keyboard")



- (void)load
{
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
    NSLog(@"CAPIonicKeyboard: resize mode %d", self.keyboardResizes);
  }
  self.hideFormAccessoryBar = YES;
  
  NSNotificationCenter *nc = [NSNotificationCenter defaultCenter];
  
  [nc addObserver:self selector:@selector(onKeyboardDidHide:) name:UIKeyboardDidHideNotification object:nil];
  [nc addObserver:self selector:@selector(onKeyboardDidShow:) name:UIKeyboardDidShowNotification object:nil];
  
  [nc removeObserver:self.webView name:UIKeyboardWillChangeFrameNotification object:nil];
  [nc removeObserver:self.webView name:UIKeyboardDidChangeFrameNotification object:nil];
}


#pragma mark Keyboard events

- (void)resetScrollView
{
  UIScrollView *scrollView = [self.webView scrollView];
  [scrollView setContentInset:UIEdgeInsetsZero];
}

- (void)onKeyboardWillHide:(NSNotification *)sender
{
  [self setKeyboardHeight:0 delay:0.01];
  [self resetScrollView];
  [self.bridge evalWithPlugin:self js:@"plugin.fireOnHiding();"];
}

- (void)onKeyboardWillShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  double duration = [[note.userInfo valueForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  [self setKeyboardHeight:height delay:duration/2.0];
  [self resetScrollView];
  
  NSString *js = [NSString stringWithFormat:@"plugin.fireOnShowing(%d);", (int)height];
  [self.bridge evalWithPlugin:self js:js];
}

- (void)onKeyboardDidShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  [self resetScrollView];
  
  NSString *js = [NSString stringWithFormat:@"plugin.fireOnShow(%d);", (int)height];
  [self.bridge evalWithPlugin:self js:js];
}

- (void)onKeyboardDidHide:(NSNotification *)sender
{
  [self.bridge evalWithPlugin:self js:@"plugin.fireOnHide();"];
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
  NSLog(@"CDVIonicKeyboard: updating frame");
  CGRect f = [[UIScreen mainScreen] bounds];
  switch (self.keyboardResizes) {
    case ResizeBody:
    {
      NSString *js = [NSString stringWithFormat:@"plugin.fireOnResize(%d, %d, document.body);",
                      (int)self.paddingBottom, (int)f.size.height];
      [self.bridge evalWithPlugin:self js:js];
      break;
    }
    case ResizeIonic:
    {
      NSString *js = [NSString stringWithFormat:@"plugin.fireOnResize(%d, %d, document.querySelector('ion-app'));",
                      (int)self.paddingBottom, (int)f.size.height];
      [self.bridge evalWithPlugin:self js:js];
      break;
    }
    case ResizeNative:
    {
      [self.webView setFrame:CGRectMake(f.origin.x, f.origin.y, f.size.width, f.size.height - self.paddingBottom)];
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
  BOOL value = [self getBool:call field:@"visible" defaultValue:FALSE];

  //NSNumber* value = [call getBool:@"visible" defaultValue:nil];
  NSLog(@"Accessory bar visible change %d", value);
  self.hideFormAccessoryBar = !value;
  [call successHandler];
}

- (void)hide:(CAPPluginCall *)command
{
  [self.webView endEditing:YES];
}


#pragma mark dealloc

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end


