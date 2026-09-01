#import <Foundation/Foundation.h>

typedef NSString * CAPPluginReturnType;
FOUNDATION_EXPORT CAPPluginReturnType _Nonnull const CAPPluginReturnNone;
FOUNDATION_EXPORT CAPPluginReturnType _Nonnull const CAPPluginReturnCallback;
FOUNDATION_EXPORT CAPPluginReturnType _Nonnull const CAPPluginReturnPromise;

typedef NS_ENUM(NSInteger, CAPPluginMethodArgumentNullability) {
    CAPPluginMethodArgumentNullabilityNotNullable = 0,
    CAPPluginMethodArgumentNullabilityNullable = 1
};

@interface CAPPluginMethodArgument : NSObject

@property (nonatomic, strong, nonnull) NSString *name;
@property (nonatomic, assign) CAPPluginMethodArgumentNullability nullability;
@property (nonatomic, strong, nonnull) NSString *type;

- (nonnull instancetype)initWithName:(nonnull NSString *)name
                         nullability:(CAPPluginMethodArgumentNullability)nullability
                                type:(nonnull NSString *)type;

@end

@interface CAPPluginMethod : NSObject

@property (nonatomic, assign, nonnull) SEL selector;
@property (nonatomic, strong, nonnull) NSString *name;
@property (nonatomic, strong, nonnull) CAPPluginReturnType returnType;

- (nonnull instancetype)initWithName:(nonnull NSString *)name
                          returnType:(nonnull CAPPluginReturnType)returnType;
- (nonnull instancetype)initWithSelector:(nonnull SEL)selector
                              returnType:(nonnull CAPPluginReturnType)returnType;

@end
