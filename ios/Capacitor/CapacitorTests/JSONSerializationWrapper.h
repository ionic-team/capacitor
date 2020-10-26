#import <Foundation/Foundation.h>

@interface JSONSerializationWrapper : NSObject
@property (nonatomic, strong) NSDictionary* _Nonnull dictionary;

- (instancetype _Nullable)initWithDictionary:(NSDictionary* _Nonnull)options;
- (NSDictionary * _Nullable)unwrappedResult;

@end
