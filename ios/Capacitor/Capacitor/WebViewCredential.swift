//
//  WebViewCredential.swift
//  Capacitor
//
//  Created by Kachalov, Victor on 15.03.21.
//  Copyright © 2021 Drifty Co. All rights reserved.
//

import Foundation

public struct WebViewCredential {
    public let user: String
    public let password: String
    public let persistence: URLCredential.Persistence

    public var asURLCredential: URLCredential {
        URLCredential(user: user, password: password, persistence: persistence)
    }
}
