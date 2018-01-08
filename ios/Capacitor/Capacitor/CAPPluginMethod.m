#import <Capacitor/Capacitor-Swift.h>
#import "CAPPluginMethod.h"

typedef void(^CAPCallback)(id _arg, NSInteger index);

@implementation CAPPluginMethodArgument

- (instancetype)initWithName:(NSString *)name nullability:(CAPPluginMethodArgumentNullability)nullability type:(NSString *)type {
  self.name = name;
  self.nullability = nullability;
  return self;
}

@end

@implementation CAPPluginMethod {
  // NSInvocation's retainArguments doesn't work with our arguments
  // so we have to retain args manually
  NSMutableArray *_manualRetainArgs;
  // Retain invocation instance
  NSInvocation *_invocation;
  NSMutableArray *_methodArgumentCallbacks;
  CAPPluginCall *_call;
  SEL _selector;
}

-(instancetype)initWithName:(NSString *)name returnType:(CAPPluginReturnType *)returnType {
  self.name = name;
  self.selector = NSSelectorFromString([name stringByAppendingString:@":"]);
  self.returnType = returnType;
  return self;
}


@end

