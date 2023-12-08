//
//  ClassUnsupported.swift
//  Capacitor
//
//  Created by Steven Sherry on 12/8/23.
//  Copyright © 2023 Drifty Co. All rights reserved.
//

import Foundation

struct ClassDecodingUnsupported: Swift.Error {
    var localizedDescription = "Classes are not currently supported for decoding. Model your data as a struct or initialize your model from a JSValue directly."
}

struct ClassEncodingUnsupported: Swift.Error {
    var localizedDescription = "Classes are not currently supported for encoding. Model your data as a struct or convert your model to a JSValue directly."
}
