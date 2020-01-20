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

#import "CDVPluginResult.h"

// This exists to preserve compatibility with early Swift plugins, who are
// using CDVCommandStatus as ObjC-style constants rather than as Swift enum
// values.
// These constants alias the enum values back to their previous names.
#define SWIFT_ENUM_COMPAT_HACK(enumVal) const CDVCommandStatus SWIFT_##enumVal NS_SWIFT_NAME(enumVal) = enumVal
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_NO_RESULT);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_OK);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_CLASS_NOT_FOUND_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_ILLEGAL_ACCESS_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_INSTANTIATION_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_MALFORMED_URL_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_IO_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_INVALID_ACTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_JSON_EXCEPTION);
SWIFT_ENUM_COMPAT_HACK(CDVCommandStatus_ERROR);
#undef SWIFT_ENUM_COMPAT_HACK

@interface CDVPluginResult ()

- (CDVPluginResult*)initWithStatus:(CDVCommandStatus)statusOrdinal message:(id)theMessage;

@end

@implementation CDVPluginResult
@synthesize status, message, keepCallback, associatedObject;

static NSArray* org_apache_cordova_CommandStatusMsgs;

id messageFromArrayBuffer(NSData* data)
{
    return @{
               @"CDVType" : @"ArrayBuffer",
               @"data" :[data base64EncodedStringWithOptions:0]
    };
}

id massageMessage(id message)
{
    if ([message isKindOfClass:[NSData class]]) {
        return messageFromArrayBuffer(message);
    }
    return message;
}

id messageFromMultipart(NSArray* theMessages)
{
    NSMutableArray* messages = [NSMutableArray arrayWithArray:theMessages];

    for (NSUInteger i = 0; i < messages.count; ++i) {
        [messages replaceObjectAtIndex:i withObject:massageMessage([messages objectAtIndex:i])];
    }

    return @{
               @"CDVType" : @"MultiPart",
               @"messages" : messages
    };
}

+ (void)initialize
{
    org_apache_cordova_CommandStatusMsgs = [[NSArray alloc] initWithObjects:@"No result",
        @"OK",
        @"Class not found",
        @"Illegal access",
        @"Instantiation error",
        @"Malformed url",
        @"IO error",
        @"Invalid action",
        @"JSON error",
        @"Error",
        nil];
}

- (CDVPluginResult*)init
{
    return [self initWithStatus:CDVCommandStatus_NO_RESULT message:nil];
}

- (CDVPluginResult*)initWithStatus:(CDVCommandStatus)statusOrdinal message:(id)theMessage
{
    self = [super init];
    if (self) {
        status = [NSNumber numberWithInt:statusOrdinal];
        message = theMessage;
        keepCallback = [NSNumber numberWithBool:NO];
    }
    return self;
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal
{
    return [[self alloc] initWithStatus:statusOrdinal message:nil];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsString:(NSString*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsArray:(NSArray*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsInt:(int)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithInt:theMessage]];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSInteger:(NSInteger)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithInteger:theMessage]];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsNSUInteger:(NSUInteger)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithUnsignedInteger:theMessage]];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsDouble:(double)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithDouble:theMessage]];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsBool:(BOOL)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:[NSNumber numberWithBool:theMessage]];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsDictionary:(NSDictionary*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:theMessage];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsArrayBuffer:(NSData*)theMessage
{
    return [[self alloc] initWithStatus:statusOrdinal message:messageFromArrayBuffer(theMessage)];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageAsMultipart:(NSArray*)theMessages
{
    return [[self alloc] initWithStatus:statusOrdinal message:messageFromMultipart(theMessages)];
}

+ (CDVPluginResult*)resultWithStatus:(CDVCommandStatus)statusOrdinal messageToErrorObject:(int)errorCode
{
    NSDictionary* errDict = @{@"code" :[NSNumber numberWithInt:errorCode]};

    return [[self alloc] initWithStatus:statusOrdinal message:errDict];
}

- (void)setKeepCallbackAsBool:(BOOL)bKeepCallback
{
    [self setKeepCallback:[NSNumber numberWithBool:bKeepCallback]];
}

- (NSString*)argumentsAsJSON
{
    id arguments = (self.message == nil ? [NSNull null] : self.message);
    NSArray* argumentsWrappedInArray = [NSArray arrayWithObject:arguments];
    
    NSString* argumentsJSON = [self JSONStringFromArray:argumentsWrappedInArray];
    
    argumentsJSON = [argumentsJSON substringWithRange:NSMakeRange(1, [argumentsJSON length] - 2)];
    
    return argumentsJSON;
}

static BOOL gIsVerbose = NO;
+ (void)setVerbose:(BOOL)verbose
{
    gIsVerbose = verbose;
}

+ (BOOL)isVerbose
{
    return gIsVerbose;
}

- (NSString*)JSONStringFromArray:(NSArray *) array
{
    NSError* error = nil;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:array
                                                       options:0
                                                         error:&error];
    
    if (error != nil) {
        NSLog(@"NSArray JSONString error: %@", [error localizedDescription]);
        return nil;
    } else {
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
}

@end
