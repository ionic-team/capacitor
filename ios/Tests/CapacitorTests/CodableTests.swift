import Foundation
import Testing
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

struct JSValueDecoderTests {
    @Test func decodingValidKeyedContainerSucceeds() throws {
        let decoder = JSValueDecoder()
        let decodedPerson = try decoder.decode(Person.self, from: rawPerson)
        #expect(decodedPerson == person)
    }

    @Test func decodingValidUnkeyedContainerSucceeds() throws {
        let decoder = JSValueDecoder()
        let decodedPeople = try decoder.decode([Person].self, from: rawPeople)
        #expect(person.family == decodedPeople)
    }

    @Test func decodingSingleValueSucceeds() throws {
        let decoder = JSValueDecoder()
        let decodedNumber = try decoder.decode(UInt.self, from: 100 as NSNumber)
        #expect(decodedNumber == 100)
    }

    @Test func decodingInvalidKeyedContainerFails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPerson = rawPerson
        invalidRawPerson["name"] = nil
        #expect(throws: DecodingError.self) {
            try decoder.decode(Person.self, from: invalidRawPerson)
        }
    }

    @Test func decodingInvalidUnkeyedContainerFails() throws {
        let decoder = JSValueDecoder()
        var invalidRawPeople = try #require(rawPeople as? [JSObject])
        invalidRawPeople[0]["name"] = nil
        #expect(throws: DecodingError.self) {
            try decoder.decode([Person].self, from: invalidRawPeople)
        }
    }

    @Test func decodingInvalidSingleValueTypeFails() throws {
        let decoder = JSValueDecoder()
        #expect(throws: DecodingError.self) {
            try decoder.decode(UInt.self, from: -1 as NSNumber)
        }
    }

    @Test func decodingValidNestedArraySucceeds() throws {
        let decoder = JSValueDecoder()
        let nestedPeople: JSArray = [rawPeople, rawPeople]
        let decodedPeople = try decoder.decode([[Person]].self, from: nestedPeople)
        #expect([person.family, person.family] == decodedPeople)
    }

    @Test func decodingClassFails() throws {
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
        #expect(throws: DecodingError.self) {
            try decoder.decode(Pet.self, from: rawPet)
        }
    }

    @Test func decodingNSNullToNilSucceeds() throws {
        let decoder = JSValueDecoder()
        var rawPersonWithNull = rawPerson
        rawPersonWithNull["pet"] = NSNull()

        let decodedPerson = try decoder.decode(Person.self, from: rawPersonWithNull)
        #expect(decodedPerson.pet == nil)
    }
}

struct JSValueEncoderTests {
    @Test func encodingNonclassCodableSucceeds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode(person)
        let encodedObject = try #require(encodedValue as? JSObject)

        let name = try #require(encodedObject["name"] as? String)
        #expect(person.name == name)
        let age = try #require(encodedObject["age"] as? NSNumber)
        #expect(person.age as NSNumber == age)

        let pet = try #require(encodedObject["pet"] as? JSObject)
        let petName = try #require(pet["name"] as? String)
        #expect(person.pet?.name == petName)
        let petBreed = try #require(pet["breed"] as? String)
        #expect(person.pet?.breed == petBreed)
        let petIsVaccinated = try #require(pet["isVaccinated"] as? Bool)
        #expect(person.pet?.isVaccinated == petIsVaccinated)

        let family = try #require(encodedObject["family"] as? [JSObject])
        #expect(person.family?.count == family.count)
        let aniName = try #require(family[0]["name"] as? String)
        #expect(person.family?[0].name == aniName)
        let aniAge = try #require(family[0]["age"] as? NSNumber)
        #expect(person.family?[0].age as? NSNumber == aniAge)

        let leiaName = try #require(family[1]["name"] as? String)
        #expect(person.family?[1].name == leiaName)
        let leiaAge = try #require(family[1]["age"] as? NSNumber)
        #expect(person.family?[1].age as? NSNumber == leiaAge)
    }

    @Test func encodingNestedUnkeyedContainerSucceeds() throws {
        let encoder = JSValueEncoder()
        let encodedValue = try encoder.encode([person.family, person.family])
        let encodedArray = try #require(encodedValue as? [[JSObject]])
        #expect(encodedArray.count == 2)
        #expect(encodedArray[0].count == 2)
        #expect(encodedArray[1].count == 2)

        let family = try #require(person.family)

        #expect(family[0].name == encodedArray[0][0]["name"] as? String)
        #expect(family[0].name == encodedArray[1][0]["name"] as? String)
        #expect(family[0].age as NSNumber == encodedArray[0][0]["age"] as? NSNumber)
        #expect(family[0].age as NSNumber == encodedArray[1][0]["age"] as? NSNumber)
        #expect(family[1].name == encodedArray[0][1]["name"] as? String)
        #expect(family[1].name == encodedArray[1][1]["name"] as? String)
        #expect(family[1].age as NSNumber == encodedArray[0][1]["age"] as? NSNumber)
        #expect(family[1].age as NSNumber == encodedArray[1][1]["age"] as? NSNumber)
    }

    @Test func encodingNilWithExplicitNullsSucceeds() throws {
        struct Test: Encodable {
            var name: String?
        }

        let explicitEncoder = JSValueEncoder(optionalEncodingStrategy: .explicitNulls)
        let encoded = try #require(try explicitEncoder.encode(Test()) as? JSObject)
        #expect(encoded["name"] is NSNull)
        #expect(encoded["name"] != nil)
    }
}
