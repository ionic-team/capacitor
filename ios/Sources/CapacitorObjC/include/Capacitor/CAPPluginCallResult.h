// These carriers are Objective-C rather than Swift because CAPPluginCall's successHandler /
// errorHandler are block-typed properties that take them as parameters. A forward declaration is
// not enough for Swift to import a block type, and Swift cannot resolve one against a class it is
// itself in the middle of defining, so the concrete definitions must precede the Swift module.
#import <Foundation/Foundation.h>

@interface CAPPluginCallResult : NSObject

@property (nonatomic, readonly, nullable) NSDictionary<NSString *, id> *data;

- (nonnull instancetype)init:(nullable NSDictionary<NSString *, id> *)data;

@end

@interface CAPPluginCallError : NSObject

@property (nonatomic, readonly, nonnull) NSString *message;
@property (nonatomic, readonly, nullable) NSString *code;
@property (nonatomic, readonly, nullable) NSError *error;
@property (nonatomic, readonly, nullable) NSDictionary<NSString *, id> *data;

- (nonnull instancetype)init:(nonnull NSString *)message
                        code:(nullable NSString *)code
                       error:(nullable NSError *)error
                        data:(nullable NSDictionary<NSString *, id> *)data
    NS_SWIFT_NAME(init(message:code:error:data:));

@end
