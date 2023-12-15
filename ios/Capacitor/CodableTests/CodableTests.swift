//
//  JSValueDecoderTest.swift
//  CapacitorTests
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import XCTest
import Capacitor

private struct Pet: Codable, Equatable {
    var name: String
    var breed: String
    var isVaccinated: Bool
}

private struct Person: Codable, Equatable {
    var name: String
    var age: UInt
    var pet: Pet?
    var family: [Person]?
}

private let rawPet: JSObject = [
    "name": "Penny",
    "breed": "Chihuahua",
    "isVaccinated": true
]

private let rawPeople: JSArray = [
    [ "name": "Anakin",
      "age": 41 as NSNumber
    ],
    [ "name": "Leia",
      "age": 20 as NSNumber
    ]
]

private let rawPerson: JSObject = [
    "name": "Luke",
    "age": 20 as NSNumber,
    "pet": rawPet,
    "family": rawPeople
]

private let person = Person(
    name: "Luke",
    age: 20,
    pet: .init(
        name: "Penny",
        breed: "Chihuahua",
        isVaccinated: true
    ),
    family: [
        Person(name: "Anakin", age: 41),
        Person(name: "Leia", age: 20)
    ]
)

final class JSValueDecoderTest: XCTestCase {
    func testDecode_when_provided_a_valid_keyed_container_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedPerson = try decoder.decode(Person.self, from: rawPerson)
        XCTAssertEqual(decodedPerson, person)
    }

    func testDecode__when_provided_a_valid_unkeyed_container_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedPeople = try decoder.decode([Person].self, from: rawPeople)
        XCTAssertEqual(person.family, decodedPeople)
    }

    func testDecode__when_provided_a_single_value_for_the_target_type__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let decodedNumber = try decoder.decode(UInt.self, from: 100 as NSNumber)
        XCTAssertEqual(100, decodedNumber)
    }

    func testDecode__when_provided_an_invalid_keyed_container_for_the_target_type__decoding_fails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPerson = rawPerson
        invalidRawPerson["name"] = nil
        XCTAssertThrowsError(try decoder.decode(Person.self, from: invalidRawPerson))
    }

    func testDecode__when_provided_an_invalid_unkeyed_container_for_the_target_type__decoding_fails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPeople = try XCTUnwrap(rawPeople as? [JSObject])
        invalidRawPeople[0]["name"] = nil
        XCTAssertThrowsError(try decoder.decode([Person].self, from: invalidRawPeople))
    }

    func testDecode__when_provided_an_invalid_single_value_type_for_the_input_value__decoding_fails() throws {
        let decoder = JSValueDecoder()
        XCTAssertThrowsError(try decoder.decode(UInt.self, from: -1 as NSNumber))
    }

    func testDecode__when_provided_a_valid_nested_array__decoding_is_successful() throws {
        let decoder = JSValueDecoder()
        let nestedPeople: JSArray = [rawPeople, rawPeople]
        let decodedPeople = try decoder.decode([[Person]].self, from: nestedPeople)
        XCTAssertEqual([person.family, person.family], decodedPeople)
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
        XCTAssertThrowsError(try decoder.decode(Pet.self, from: rawPet))
    }

    func testDecode__when_nsnull_explicitly_present_in_container__it_correctly_decodes_to_nil() throws {
        let decoder = JSValueDecoder()
        var rawPerson = rawPerson
        rawPerson["pet"] = NSNull()

        let decodedPerson = try decoder.decode(Person.self, from: rawPerson)
        XCTAssertNil(decodedPerson.pet)
    }
}

final class JSValueEncoderTest: XCTestCase {
    func testEncode__when_provided_with_an_instance_of_nonclass_codable_instance__encoding_succeeds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode(person)
        let encodedObject = try XCTUnwrap(encodedValue as? JSObject)

        let name = try XCTUnwrap(encodedObject["name"] as? String)
        XCTAssertEqual(person.name, name)
        let age = try XCTUnwrap(encodedObject["age"] as? NSNumber)
        XCTAssertEqual(person.age as NSNumber, age)

        let pet = try XCTUnwrap(encodedObject["pet"] as? JSObject)
        let petName = try XCTUnwrap(pet["name"] as? String)
        XCTAssertEqual(person.pet?.name, petName)
        let petBreed = try XCTUnwrap(pet["breed"] as? String)
        XCTAssertEqual(person.pet?.breed, petBreed)
        let petIsVaccinated = try XCTUnwrap(pet["isVaccinated"] as? Bool)
        XCTAssertEqual(person.pet?.isVaccinated, petIsVaccinated)

        let family = try XCTUnwrap(encodedObject["family"] as? [JSObject])
        XCTAssertEqual(person.family?.count, family.count)
        let aniName = try XCTUnwrap(family[0]["name"] as? String)
        XCTAssertEqual(person.family?[0].name, aniName)
        let aniAge = try XCTUnwrap(family[0]["age"] as? NSNumber)
        XCTAssertEqual(person.family?[0].age as? NSNumber, aniAge)

        let leiaName = try XCTUnwrap(family[1]["name"] as? String)
        XCTAssertEqual(person.family?[1].name, leiaName)
        let leiaAge = try XCTUnwrap(family[1]["age"] as? NSNumber)
        XCTAssertEqual(person.family?[1].age as? NSNumber, leiaAge)
    }

    func testEncode__when_provided_an_instance_of_a_nested_unkeyed_container__encoding_succedds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode([person.family, person.family])
        let encodedArray = try XCTUnwrap(encodedValue as? [[JSObject]])
        XCTAssertEqual(encodedArray.count, 2)
        XCTAssertEqual(encodedArray[0].count, 2)
        XCTAssertEqual(encodedArray[1].count, 2)

        let family = try XCTUnwrap(person.family)

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
            var name: String?
        }

        let explicitEncoder = JSValueEncoder(optionalEncodingStrategy: .explicitNulls)
        let encoded = try XCTUnwrap(try explicitEncoder.encode(Test()) as? JSObject)
        XCTAssertTrue(encoded["name"] is NSNull)
        XCTAssertNotNil(encoded["name"])
    }
}
