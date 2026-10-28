//
//  Router.swift
//  Capacitor
//
//  Created by Steven Sherry on 3/29/22.
//  Copyright © 2022 Drifty Co. All rights reserved.
//

import Foundation

public protocol Router {
    func route(for path: String) -> String
    var basePath: String { get set }
}

public struct CapacitorRouter: Router {
    public init() {}
    public var basePath: String = ""
    public func route(for path: String) -> String {
        let pathUrl = URL(fileURLWithPath: path)

        // If there's no path extension it also means the path is empty or a SPA route
        if pathUrl.pathExtension.isEmpty {
            return basePath + "/index.html"
        }

        return basePath + path
    }
}
