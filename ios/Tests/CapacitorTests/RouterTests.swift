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
    
    func testRouterReturnsIndexWhenProvidedEmptyPath() {
        checkRouter(path: "", expected: "/index.html")
    }
    
    func testRouterReturnsIndexWhenProviedPathWithoutExtension() {
        checkRouter(path: "/a/valid/path/no/ext", expected: "/index.html")
    }
    
    func testRouterReturnsPathWhenProvidedValidPath() {
        checkRouter(path: "/a/valid/path.ext", expected: "/a/valid/path.ext")
    }
    
    func testRouterReturnsPathWhenProvidedValidPathWithExtensionAndSpaces() {
        checkRouter(path: "/a/valid/file path.ext", expected: "/a/valid/file path.ext")
    }
    
    func checkRouter(path: String, expected: String) {
        XCTContext.runActivity(named: "router creates route path correctly") { _ in
            var router = CapacitorRouter()
            XCTAssertEqual(router.route(for: path), expected)
            router.basePath = "/A/Route"
            XCTAssertEqual(router.route(for: path), "/A/Route" + expected)
        }
    }
    
}
