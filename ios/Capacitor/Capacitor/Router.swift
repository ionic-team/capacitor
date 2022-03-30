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
}

// swiftlint:disable:next type_name
internal struct _Router: Router {
    func route(for path: String) -> String {
        let pathUrl = URL(string: path)
       
        // if the pathUrl is null, then it is an invalid url (meaning it is empty or just plain invalid) then we want to route to /index.html
        if pathUrl?.pathExtension.isEmpty ?? true {
            return "/index.html"
        }
        
        return path
    }
}
