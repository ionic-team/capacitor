#import "AVCPluginCall.h"
#import "AVCPlugin.h"

typedef enum {
  AVCPluginMethodArgumentNotNullable,
  AVCPluginMethodArgumentNullable
} AVCPluginMethodArgumentNullability;

typedef NSString AVCPluginReturnType;

/**
 * Represents a single argument to a plugin method.
 */
@interface AVCPluginMethodArgument : NSObject

@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) AVCPluginMethodArgumentNullability nullability;

- (instancetype)initWithName:(NSString *)name nullability:(AVCPluginMethodArgumentNullability)nullability type:(NSString *)type;

@end

/**
 * Represents a method that a plugin supports, with the ability
 * to compute selectors and invoke the method.
 */
@interface AVCPluginMethod : NSObject

@property (nonatomic, assign) SEL selector;
@property (nonatomic, strong) NSString *name; // Raw method name
@property (nonatomic, strong) AVCPluginReturnType *returnType; // Return type of method (i.e. callback/promise/sync)

- (instancetype)initWithName:(NSString *)name returnType:(AVCPluginReturnType *)returnType;


@end
