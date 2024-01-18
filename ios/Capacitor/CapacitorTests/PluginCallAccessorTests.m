#import <XCTest/XCTest.h>
#import <Capacitor/Capacitor.h>
#import <Capacitor/CAPBridgedJSTypes.h>
#import "CapacitorTests-Swift.h"

// interface for this class
@interface PluginCallAccessorTests : XCTestCase
@property (strong, nonatomic) CAPPluginCall* call;
@end

@implementation PluginCallAccessorTests

- (void)setUp {
    [super setUp];
    NSDate* date = [[NSDate alloc] initWithTimeIntervalSinceReferenceDate:632854800];
    NSISO8601DateFormatter *formatter = [[NSISO8601DateFormatter alloc] init];
    NSDictionary* options = @{@"testString":@"foo",
                              @"testDict": @{@"testSubkey":@"sub value"},
                              @"testFloat": @3.14159,
                              @"testDateObject": date,
                              @"testDateString": [formatter stringFromDate:date],
                              @"testBoolTrue": @TRUE,
                              @"testBoolFalse": @FALSE};
    [self setCall:[[CAPPluginCall alloc] initWithCallbackId:@"test" options:options  success:NULL error:NULL]];
}

- (void)testStringAccessor {
    NSString* value = [[self call] getString:@"testString" defaultValue:NULL];
    XCTAssertEqual(value, @"foo");
    
    value = [[self call] getString:@"badString" defaultValue:NULL];
    XCTAssertNil(value);
    
    value = [[self call] getString:@"badString" defaultValue:@"default"];
    XCTAssertEqual(value, @"default");
}

- (void)testDateObjectAccessor {
    NSDate* value = [[self call] getDate:@"testDateObject" defaultValue:NULL];
    XCTAssertEqual([value timeIntervalSinceReferenceDate], 632854800);
    
    value = [[self call] getDate:@"badString" defaultValue:NULL];
    XCTAssertNil(value);

    NSDate *defaultDate = [NSDate date];
    value = [[self call] getDate:@"badString" defaultValue:defaultDate];
    XCTAssertEqual(value, defaultDate);
}

- (void)testDateStringAccessor {
    NSDate* objectValue = [[self call] getDate:@"testDateObject" defaultValue:NULL];
    NSDate* stringValue = [[self call] getDate:@"testDateString" defaultValue:NULL];
    XCTAssertNotNil(objectValue);
    XCTAssertNotNil(stringValue);
    XCTAssertEqual(objectValue, stringValue);
}

- (void)testObjectAccessor {
    NSDictionary* value = [[self call] getObject:@"testDict" defaultValue:NULL];
    XCTAssertEqual([value objectForKey:@"testSubkey"], @"sub value");
    
    value = [[self call] getObject:@"badString" defaultValue:NULL];
    XCTAssertNil(value);
    
    value = [[self call] getObject:@"badString" defaultValue:@{@"defaultKey":@"default"}];
    XCTAssertEqual([value objectForKey:@"defaultKey"], @"default");
}

- (void)testNumberAccessor {
    NSNumber* value = [[self call] getNumber:@"testFloat" defaultValue:NULL];
    XCTAssertNotNil(value);
    XCTAssertTrue([value isEqualToNumber:@3.14159]);
    
    value = [[self call] getNumber:@"badString" defaultValue:NULL];
    XCTAssertNil(value);
    
    value = [[self call] getNumber:@"badString" defaultValue:@100];
    XCTAssertEqual([value intValue], 100);
    
    value = [[self call] getNumber:@"testBoolTrue" defaultValue:NULL];
    XCTAssertNotNil(value);
    XCTAssertEqual([value boolValue], TRUE);
}

- (void)testBoolAccessor {
    BOOL value = [[self call] getBool:@"testBoolTrue" defaultValue:false];
    XCTAssertTrue(value);
    
    value = [[self call] getBool:@"testBoolFalse" defaultValue:true];
    XCTAssertFalse(value);
    
    value = [[self call] getBool:@"badString" defaultValue:true];
    XCTAssertTrue(value);
    
    value = [[self call] getBool:@"badString" defaultValue:false];
    XCTAssertFalse(value);
}
@end
