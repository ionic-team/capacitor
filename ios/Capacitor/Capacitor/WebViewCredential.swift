//
//  WebViewCredential.swift
//  Capacitor
//
//  Created by Kachalov, Victor on 15.03.21.
//  Copyright © 2021 Drifty Co. All rights reserved.
//

import Foundation

@objc(WebViewCredential)
open class WebViewCredential: NSObject {
    @objc public let user: String
    @objc public let password: String
    @objc public let persistence: URLCredential.Persistence

    @objc public var asURLCredential: URLCredential {
        URLCredential(user: user, password: password, persistence: persistence)
    }

    @objc public init(user: String, password: String, persistence: URLCredential.Persistence) {
        self.user = user
        self.password = password
        self.persistence = persistence
        super.init()
    }
}
