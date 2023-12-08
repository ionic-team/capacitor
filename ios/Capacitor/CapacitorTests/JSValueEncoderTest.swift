//
//  JSValueEncoderTest.swift
//  CapacitorTests
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

fileprivate typealias Data = CodableTestData

final class JSValueEncoderTest: XCTestCase {
    func testEncode__when_provided_with_an_instance_of_nonclass_codable_instance__encoding_succeeds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode(Data.person)
        let encodedObject = try XCTUnwrap(encodedValue as? JSObject)

        let name = try XCTUnwrap(encodedObject["name"] as? String)
        XCTAssertEqual(Data.person.name, name)
        let age = try XCTUnwrap(encodedObject["age"] as? NSNumber)
        XCTAssertEqual(Data.person.age as NSNumber, age)

        let pet = try XCTUnwrap(encodedObject["pet"] as? JSObject)
        let petName = try XCTUnwrap(pet["name"] as? String)
        XCTAssertEqual(Data.person.pet?.name, petName)
        let petBreed = try XCTUnwrap(pet["breed"] as? String)
        XCTAssertEqual(Data.person.pet?.breed, petBreed)
        let petIsVaccinated = try XCTUnwrap(pet["isVaccinated"] as? Bool)
        XCTAssertEqual(Data.person.pet?.isVaccinated, petIsVaccinated)

        let family = try XCTUnwrap(encodedObject["family"] as? [JSObject])
        XCTAssertEqual(Data.person.family?.count, family.count)
        let aniName = try XCTUnwrap(family[0]["name"] as? String)
        XCTAssertEqual(Data.person.family?[0].name, aniName)
        let aniAge = try XCTUnwrap(family[0]["age"] as? NSNumber)
        XCTAssertEqual(Data.person.family?[0].age as? NSNumber, aniAge)

        let leiaName = try XCTUnwrap(family[1]["name"] as? String)
        XCTAssertEqual(Data.person.family?[1].name, leiaName)
        let leiaAge = try XCTUnwrap(family[1]["age"] as? NSNumber)
        XCTAssertEqual(Data.person.family?[1].age as? NSNumber, leiaAge)
    }

    func testEncode__when_provided_an_instance_of_a_nested_unkeyed_container__encoding_succedds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode([Data.person.family, Data.person.family])
        let encodedArray = try XCTUnwrap(encodedValue as? [[JSObject]])
        XCTAssertEqual(encodedArray.count, 2)
        XCTAssertEqual(encodedArray[0].count, 2)
        XCTAssertEqual(encodedArray[1].count, 2)

        let family = try XCTUnwrap(Data.person.family)

        XCTAssertEqual(family[0].name, encodedArray[0][0]["name"] as? String)
        XCTAssertEqual(family[0].name, encodedArray[1][0]["name"] as? String)
        XCTAssertEqual(family[0].age as NSNumber, encodedArray[0][0]["age"] as? NSNumber)
        XCTAssertEqual(family[0].age as NSNumber, encodedArray[1][0]["age"] as? NSNumber)
        XCTAssertEqual(family[1].name, encodedArray[0][1]["name"] as? String)
        XCTAssertEqual(family[1].name, encodedArray[1][1]["name"] as? String)
        XCTAssertEqual(family[1].age as NSNumber, encodedArray[0][1]["age"] as? NSNumber)
        XCTAssertEqual(family[1].age as NSNumber, encodedArray[1][1]["age"] as? NSNumber)
    }

    func testEncode__when_nil_is_present_in_value__and_optional_encoding_is_set_to_explicit_nulls__it_is_encoded_as_nsnull() throws {
        struct Test: Encodable {
            var name: String? = nil
        }

        let explicitEncoder = JSValueEncoder(optionalEncodingStrategy: .explicitNulls)
        var encoded = try XCTUnwrap(try explicitEncoder.encode(Test()) as? JSObject)
        XCTAssertTrue(encoded["name"] is NSNull)
        XCTAssertNotNil(encoded["name"])
    }

    func testEncode__when_provided_with_an_instance_of_a_codable_class__encoding_fails() throws {
        class Foo: Encodable {
            let value: Int
            init(value: Int) {
                self.value = value
            }
        }

        let encoder = JSValueEncoder()
        XCTAssertThrowsError(try encoder.encode(Foo(value: 1)))
    }
}
