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
    
    func testRouterWithFallbackReturnsIndexWhenFileDoesNotExist() {
        XCTContext.runActivity(named: "router with fallback returns index.html for non-existent files") { _ in
            var router = CapacitorRouter()
            router.basePath = "/NonExistentPath"
            
            // When checkFileExists is true and file doesn't exist, should return index.html
            XCTAssertEqual(router.route(for: "/@user.name", checkFileExists: true), "/NonExistentPath/index.html")
            XCTAssertEqual(router.route(for: "/api/data.json", checkFileExists: true), "/NonExistentPath/index.html")
            
            // When checkFileExists is false, should return the path as-is
            XCTAssertEqual(router.route(for: "/@user.name", checkFileExists: false), "/NonExistentPath/@user.name")
            XCTAssertEqual(router.route(for: "/api/data.json", checkFileExists: false), "/NonExistentPath/api/data.json")
        }
    }
    
    func checkRouter(path: String, expected: String) {
        XCTContext.runActivity(named: "router creates route path correctly") { _ in
            var router = CapacitorRouter()
            XCTAssertEqual(router.route(for: path, checkFileExists: false), expected)
            router.basePath = "/A/Route"
            XCTAssertEqual(router.route(for: path, checkFileExists: false), "/A/Route" + expected)
        }
    }
    
}
