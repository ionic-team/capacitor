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
