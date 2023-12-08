//
//  JSValueCodableTestData.swift
//  CapacitorTests
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import Foundation
import Capacitor

enum CodableTestData {
    struct Pet: Codable, Equatable {
        var name: String
        var breed: String
        var isVaccinated: Bool
    }

    struct Person: Codable, Equatable {
        var name: String
        var age: UInt
        var pet: Pet?
        var family: [Person]?
    }


    static let rawPet: JSObject = [
        "name": "Penny",
        "breed": "Chihuahua",
        "isVaccinated": true
    ]

    static let rawPeople: JSArray = [
        [ "name": "Anakin",
          "age": 41 as NSNumber
        ],
        [ "name": "Leia",
          "age": 20 as NSNumber
        ]
    ]

    static let rawPerson: JSObject = [
        "name": "Luke",
        "age": 20 as NSNumber,
        "pet": rawPet,
        "family": rawPeople
    ]

    static let person = Person(
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

}

