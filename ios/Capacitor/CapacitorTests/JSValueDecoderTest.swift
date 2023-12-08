//
//  JSValueDecoderTest.swift
//  CapacitorTests
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

fileprivate typealias Data = CodableTestData
fileprivate typealias Person = CodableTestData.Person
fileprivate typealias Pet = CodableTestData.Pet

final class JSValueDecoderTest: XCTestCase {
    func testDecode_when_provided_a_valid_keyed_container_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedPerson = try decoder.decode(Person.self, from: Data.rawPerson)
        XCTAssertEqual(decodedPerson, Data.person)
    }

    func testDecode__when_provided_a_valid_unkeyed_container_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedPeople = try decoder.decode([Person].self, from: Data.rawPeople)
        XCTAssertEqual(Data.person.family, decodedPeople)
    }

    func testDecode__when_provided_a_single_value_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedNumber = try decoder.decode(UInt.self, from: 100 as NSNumber)
        XCTAssertEqual(100, decodedNumber)
    }

    func testDecode__when_provided_an_invalid_keyed_container_for_the_target_type__decoding_fails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPerson = Data.rawPerson
        invalidRawPerson["name"] = nil
        XCTAssertThrowsError(try decoder.decode(Person.self, from: invalidRawPerson))
    }

    func testDecode__when_provided_an_invalid_unkeyed_container_for_the_target_type__decoding_fails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPeople = try XCTUnwrap(Data.rawPeople as? [JSObject])
        invalidRawPeople[0]["name"] = nil
        XCTAssertThrowsError(try decoder.decode([Person].self, from: invalidRawPeople))
    }

    func testDecode__when_provided_an_invalid_single_value_type_for_the_input_value__decoding_fails() throws {
        let decoder = JSValueDecoder()
        XCTAssertThrowsError(try decoder.decode(UInt.self, from: -1 as NSNumber))
    }

    func testDecode__when_provided_a_valid_nested_array__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let nestedPeople: JSArray = [Data.rawPeople, Data.rawPeople]
        let decodedPeople = try decoder.decode([[Person]].self, from: nestedPeople)
        XCTAssertEqual([Data.person.family, Data.person.family], decodedPeople)
    }

    func testDecode_when_attempting_to_decode_a_class__decoding_fails() throws {
        class Pet: Decodable {
            var name: String
            var breed: String
            var isVaccinated: String
            init(name: String, breed: String, isVaccinated: String) {
                self.name = name
                self.breed = breed
                self.isVaccinated = isVaccinated
            }
        }

        let decoder = JSValueDecoder()
        XCTAssertThrowsError(try decoder.decode(Pet.self, from: Data.rawPet))
    }

    func testDecode__when_nsnull_explicitly_present_in_container__it_correctly_decodes_to_nil() throws {
        let decoder = JSValueDecoder()
        var rawPerson = Data.rawPerson
        rawPerson["pet"] = NSNull()

        let decodedPerson = try decoder.decode(Person.self, from: rawPerson)
        XCTAssertNil(decodedPerson.pet)
    }
}
