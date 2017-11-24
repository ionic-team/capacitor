import Foundation

public class Diagnostics {
  /**
   * Get current memory usage
   */
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
  
  /**
   * Get free disk space
   */
  public func getFreeDiskSize() -> Int64? {
    let paths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
    if let dictionary = try? FileManager.default.attributesOfFileSystem(forPath: paths.last!) {
      if let freeSize = dictionary[FileAttributeKey.systemFreeSize] as? NSNumber {
        return freeSize.int64Value
      }
    }
    return nil
  }
  
  /**
   * Get total disk size
   */
  public func getTotalDiskSize() -> Int64?{
    let paths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
    if let dictionary = try? FileManager.default.attributesOfFileSystem(forPath: paths.last!) {
      if let freeSize = dictionary[FileAttributeKey.systemSize] as? NSNumber {
        return freeSize.int64Value
      }
    }
    return nil
  }
}
