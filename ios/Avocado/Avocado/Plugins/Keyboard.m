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
#import "PluginBridge.h"
#import <Foundation/Foundation.h>
#import <objc/runtime.h>

typedef enum : NSUInteger {
  ResizeNone,
  ResizeNative,
  ResizeBody,
  ResizeIonic,
} ResizePolicy;


@interface AVCKeyboard () <UIScrollViewDelegate>

@property (nonatomic, readwrite, assign) BOOL keyboardIsVisible;
@property (nonatomic, readwrite) ResizePolicy keyboardResizes;
@property (nonatomic, readwrite) int paddingBottom;

@end

@implementation AVCKeyboard

AVOCADO_EXPORT_PLUGIN("com.avocadojs.plugin.keyboard")

- (void)load
{
  self.keyboardResizes = ResizeNative;
  BOOL doesResize = YES;
  if (!doesResize) {
    self.keyboardResizes = ResizeNone;
    NSLog(@"CDVIonicKeyboard: no resize");
    
  } else {
    NSString *resizeMode = @"ionic";
    if (resizeMode) {
      if ([resizeMode isEqualToString:@"ionic"]) {
        self.keyboardResizes = ResizeIonic;
      } else if ([resizeMode isEqualToString:@"body"]) {
        self.keyboardResizes = ResizeBody;
      }
    }
    NSLog(@"CDVIonicKeyboard: resize mode %d", self.keyboardResizes);
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
  //[self.commandDelegate evalJs:@"Keyboard.fireOnHiding();"];
}

- (void)onKeyboardWillShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  double duration = [[note.userInfo valueForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  [self setKeyboardHeight:height delay:duration/2.0];
  [self resetScrollView];
  
  NSString *js = [NSString stringWithFormat:@"Keyboard.fireOnShowing(%d);", (int)height];
  //[self.commandDelegate evalJs:js];
}

- (void)onKeyboardDidShow:(NSNotification *)note
{
  CGRect rect = [[note.userInfo valueForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
  double height = rect.size.height;
  
  [self resetScrollView];
  
  NSString *js = [NSString stringWithFormat:@"Keyboard.fireOnShow(%d);", (int)height];
  //[self.commandDelegate evalJs:js];
}

- (void)onKeyboardDidHide:(NSNotification *)sender
{
  //[self.commandDelegate evalJs:@"Keyboard.fireOnHide();"];
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
  
  __weak AVCKeyboard* weakSelf = self;
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
      NSString *js = [NSString stringWithFormat:@"Keyboard.fireOnResize(%d, %d, document.body);",
                      (int)self.paddingBottom, (int)f.size.height];
      //[self.commandDelegate evalJs:js];
      break;
    }
    case ResizeIonic:
    {
      NSString *js = [NSString stringWithFormat:@"Keyboard.fireOnResize(%d, %d, document.querySelector('ion-app'));",
                      (int)self.paddingBottom, (int)f.size.height];
      //[self.commandDelegate evalJs:js];
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

- (void)hideFormAccessoryBar:(AVCPluginCall *)command
{
  /*
  if (command.arguments.count > 0) {
    id value = [command.arguments objectAtIndex:0];
    if (!([value isKindOfClass:[NSNumber class]])) {
      value = [NSNumber numberWithBool:NO];
    }
    
    self.hideFormAccessoryBar = [value boolValue];
  }
  
  [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:self.hideFormAccessoryBar]
                              callbackId:command.callbackId];
   */
}

- (void)hide:(AVCPluginCall *)command
{
  [self.webView endEditing:YES];
}


#pragma mark dealloc

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end


