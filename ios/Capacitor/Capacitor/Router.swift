//
//  Router.swift
//  Capacitor
//
//  Created by Steven Sherry on 3/29/22.
//  Copyright © 2022 Drifty Co. All rights reserved.
//

import Foundation

public protocol Router {
    func route(for path: String, checkFileExists: Bool) -> String
    var basePath: String { get set }
}

public struct CapacitorRouter: Router {
    public init() {}
    public var basePath: String = ""
    
    public func route(for path: String, checkFileExists: Bool = false) -> String {
        let pathUrl = URL(fileURLWithPath: path)

        // If there's no path extension it also means the path is empty or a SPA route
        if pathUrl.pathExtension.isEmpty {
            return basePath + "/index.html"
        }
        
        // If checkFileExists is enabled and file doesn't exist, fallback to index.html
        if checkFileExists {
            let fullPath = basePath + path
            if !FileManager.default.fileExists(atPath: fullPath) {
                return basePath + "/index.html"
            }
        }

        return basePath + path
    }
}
