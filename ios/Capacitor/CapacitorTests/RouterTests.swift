//
//  RouterTests.swift
//  CapacitorTests
//
//  Created by Steven Sherry on 3/29/22.
//  Copyright © 2022 Drifty Co. All rights reserved.
//

import XCTest
@testable import Capacitor

class RouterTests: XCTestCase {
    let router = _Router()
    
    func testRouterReturnsIndexWhenProvidedEmptyPath() {
        XCTAssertEqual(router.route(for: ""), "/index.html")
    }
    
    func testRouterReturnsIndexWhenProviedPathWithoutExtension() {
        XCTAssertEqual(router.route(for: "/a/valid/path/no/ext"), "/index.html")
    }
    
    func testRouterReturnsPathWhenProvidedValidPath() {
        XCTAssertEqual(router.route(for: "/a/valid/path.ext"), "/a/valid/path.ext")
    }
    
    func testRouterReturnsPathWhenProvidedValidPathWithExtensionAndSpaces() {
        XCTAssertEqual(router.route(for: "/a/valid/file path.ext"), "/a/valid/file path.ext")
    }
}
