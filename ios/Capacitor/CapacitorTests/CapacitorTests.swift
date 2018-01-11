//
//  AvocadoTests.swift
//  AvocadoTests
//
//  Created by Max Lynch on 11/18/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import XCTest
@testable import Capacitor 

class MockWebView: WKWebView {
}

class MockBridgeViewController : BridgeViewController {
}

class MockBridge : Bridge {
  public override func registerPlugins() {
    print("REGISER PLUITTTINS")
  }
}
class AvocadoTests: XCTestCase {
    
    override func setUp() {
        super.setUp()
        // Put setup code here. This method is called before the invocation of each test method in the class.
      var bridge = MockBridge(MockBridgeViewController(), MockWebView())
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testExample() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }
    
    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }
    
}
