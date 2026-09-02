#import <XCTest/XCTest.h>
#import <Capacitor/Capacitor.h>
#import "CapacitorTests-Swift.h"

// interface for this class
@interface BridgedTypesTestsObjc : XCTestCase
@end

@implementation BridgedTypesTestsObjc

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testNullHandling {
    NSArray* source = @[@"test", [NSNull null], @3];
    NSArray* result = [[BridgedTypesHelper shared] validTransformationOfArray:source];
    NSError *error = nil;
    // test that the replaced null value exists
    id value = [result objectAtIndex:1];
    XCTAssertNotNil(value);
    XCTAssertTrue([value isKindOfClass:[NSNull class]]);
    // test that the null value casts to non-optional
    value = [[BridgedTypesHelper shared] testCastOf:result atIndex:1 error:&error];
    XCTAssertNotNil(value);
    XCTAssertNil(error);
}

- (void)testOptionalHandling {
    NSArray* source = @[@"test", [NSNull null], @3];
    NSArray* result = [[BridgedTypesHelper shared] invalidTransformationOfArray:source];
    NSError *error = nil;
    // test that the removed null value, now optional, is automatically transformed back into a NSNull
    id value = [result objectAtIndex:1];
    XCTAssertNotNil(value);
    XCTAssertTrue([value isKindOfClass:[NSNull class]]);
    // test that the optional value fails to cast to non-optional
    value = [[BridgedTypesHelper shared] testCastOf:result atIndex:1 error:&error];
    XCTAssertNil(value);
    XCTAssertNotNil(error);
}
@end
