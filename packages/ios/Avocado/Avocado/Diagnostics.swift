//
//  Dignostics.swift
//  Avocado
//
//  Created by Max Lynch on 11/24/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

public class Diagnostics {
  public func getMemoryUsage() -> UInt64 {
    var taskInfo = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4
    let kerr: kern_return_t = withUnsafeMutablePointer(to: &taskInfo) {
      $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
        task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), $0, &count)
      }
    }
  
    if kerr == KERN_SUCCESS {
      return taskInfo.resident_size
    } else {
      return 0
    }
  }
}
