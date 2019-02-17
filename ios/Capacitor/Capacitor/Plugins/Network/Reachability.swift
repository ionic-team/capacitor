/*
 Copyright (c) 2014, Ashley Mills
 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 1. Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 */

import SystemConfiguration
import Foundation

public enum ReachabilityError: Error {
  case FailedToCreateWithAddress(sockaddr_in)
  case FailedToCreateWithHostname(String)
  case UnableToSetCallback
  case UnableToSetDispatchQueue
}

@available(*, unavailable, renamed: "Notification.Name.reachabilityChanged")
public let ReachabilityChangedNotification = NSNotification.Name("ReachabilityChangedNotification")

extension Notification.Name {
  public static let reachabilityChanged = Notification.Name("reachabilityChanged")
}

func callback(reachability:SCNetworkReachability, flags: SCNetworkReachabilityFlags, info: UnsafeMutableRawPointer?) {
  
  guard let info = info else { return }
  
  let reachability = Unmanaged<Reachability>.fromOpaque(info).takeUnretainedValue()
  reachability.reachabilityChanged()
}

public class Reachability {
  
  public typealias NetworkReachable = (Reachability) -> ()
  public typealias NetworkUnreachable = (Reachability) -> ()
  
  @available(*, unavailable, renamed: "Conection")
  public enum NetworkStatus: CustomStringConvertible {
    case notReachable, reachableViaWiFi, reachableViaWWAN
    public var description: String {
      switch self {
      case .reachableViaWWAN: return "Cellular"
      case .reachableViaWiFi: return "WiFi"
      case .notReachable: return "No Connection"
      }
    }
  }
  
  public enum Connection: CustomStringConvertible {
    case none, wifi, cellular
    public var description: String {
      switch self {
      case .cellular: return "Cellular"
      case .wifi: return "WiFi"
      case .none: return "No Connection"
      }
    }
  }
  
  public var whenReachable: NetworkReachable?
  public var whenUnreachable: NetworkUnreachable?
  
  @available(*, deprecated: 4.0, renamed: "allowsCellularConnection")
  public let reachableOnWWAN: Bool = true
  
  /// Set to `false` to force Reachability.connection to .none when on cellular connection (default value `true`)
  public var allowsCellularConnection: Bool
  
  // The notification center on which "reachability changed" events are being posted
  public var notificationCenter: NotificationCenter = NotificationCenter.default
  
  @available(*, deprecated: 4.0, renamed: "connection.description")
  public var currentReachabilityString: String {
    return "\(connection)"
  }
  
  @available(*, unavailable, renamed: "connection")
  public var currentReachabilityStatus: Connection {
    return connection
  }
  
  public var connection: Connection {
    
    guard isReachableFlagSet else { return .none }
    
    // If we're reachable, but not on an iOS device (i.e. simulator), we must be on WiFi
    guard isRunningOnDevice else { return .wifi }
    
    var connection = Connection.none
    
    if !isConnectionRequiredFlagSet {
      connection = .wifi
    }
    
    if isConnectionOnTrafficOrDemandFlagSet {
      if !isInterventionRequiredFlagSet {
        connection = .wifi
      }
    }
    
    if isOnWWANFlagSet {
      if !allowsCellularConnection {
        connection = .none
      } else {
        connection = .cellular
      }
    }
    
    return connection
  }
  
  fileprivate var previousFlags: SCNetworkReachabilityFlags?
  
  fileprivate var isRunningOnDevice: Bool = {
    #if targetEnvironment(simulator)
      return false
    #else
      return true
    #endif
  }()
  
  fileprivate var notifierRunning = false
  fileprivate let reachabilityRef: SCNetworkReachability
  
  fileprivate let reachabilitySerialQueue = DispatchQueue(label: "uk.co.ashleymills.reachability")
  
  required public init(reachabilityRef: SCNetworkReachability) {
    allowsCellularConnection = true
    self.reachabilityRef = reachabilityRef
  }
  
  public convenience init?(hostname: String) {
    
    guard let ref = SCNetworkReachabilityCreateWithName(nil, hostname) else { return nil }
    
    self.init(reachabilityRef: ref)
  }
  
  public convenience init?() {
    
    var zeroAddress = sockaddr()
    zeroAddress.sa_len = UInt8(MemoryLayout<sockaddr>.size)
    zeroAddress.sa_family = sa_family_t(AF_INET)
    
    guard let ref = SCNetworkReachabilityCreateWithAddress(nil, &zeroAddress) else { return nil }
    
    self.init(reachabilityRef: ref)
  }
  
  deinit {
    stopNotifier()
  }
}

public extension Reachability {
  
  // MARK: - *** Notifier methods ***
  func startNotifier() throws {
    
    guard !notifierRunning else { return }
    
    var context = SCNetworkReachabilityContext(version: 0, info: nil, retain: nil, release: nil, copyDescription: nil)
    context.info = UnsafeMutableRawPointer(Unmanaged<Reachability>.passUnretained(self).toOpaque())
    if !SCNetworkReachabilitySetCallback(reachabilityRef, callback, &context) {
      stopNotifier()
      throw ReachabilityError.UnableToSetCallback
    }
    
    if !SCNetworkReachabilitySetDispatchQueue(reachabilityRef, reachabilitySerialQueue) {
      stopNotifier()
      throw ReachabilityError.UnableToSetDispatchQueue
    }
    
    // Perform an initial check
    reachabilitySerialQueue.async {
      self.reachabilityChanged()
    }
    
    notifierRunning = true
  }
  
  func stopNotifier() {
    defer { notifierRunning = false }
    
    SCNetworkReachabilitySetCallback(reachabilityRef, nil, nil)
    SCNetworkReachabilitySetDispatchQueue(reachabilityRef, nil)
  }
  
  // MARK: - *** Connection test methods ***
  @available(*, deprecated: 4.0, message: "Please use `connection != .none`")
  var isReachable: Bool {
    
    guard isReachableFlagSet else { return false }
    
    if isConnectionRequiredAndTransientFlagSet {
      return false
    }
    
    if isRunningOnDevice {
      if isOnWWANFlagSet && !reachableOnWWAN {
        // We don't want to connect when on cellular connection
        return false
      }
    }
    
    return true
  }
  
  @available(*, deprecated: 4.0, message: "Please use `connection == .cellular`")
  var isReachableViaWWAN: Bool {
    // Check we're not on the simulator, we're REACHABLE and check we're on WWAN
    return isRunningOnDevice && isReachableFlagSet && isOnWWANFlagSet
  }
  
  @available(*, deprecated: 4.0, message: "Please use `connection == .wifi`")
  var isReachableViaWiFi: Bool {
    
    // Check we're reachable
    guard isReachableFlagSet else { return false }
    
    // If reachable we're reachable, but not on an iOS device (i.e. simulator), we must be on WiFi
    guard isRunningOnDevice else { return true }
    
    // Check we're NOT on WWAN
    return !isOnWWANFlagSet
  }
  
  var description: String {
    
    let W = isRunningOnDevice ? (isOnWWANFlagSet ? "W" : "-") : "X"
    let R = isReachableFlagSet ? "R" : "-"
    let c = isConnectionRequiredFlagSet ? "c" : "-"
    let t = isTransientConnectionFlagSet ? "t" : "-"
    let i = isInterventionRequiredFlagSet ? "i" : "-"
    let C = isConnectionOnTrafficFlagSet ? "C" : "-"
    let D = isConnectionOnDemandFlagSet ? "D" : "-"
    let l = isLocalAddressFlagSet ? "l" : "-"
    let d = isDirectFlagSet ? "d" : "-"
    
    return "\(W)\(R) \(c)\(t)\(i)\(C)\(D)\(l)\(d)"
  }
}

fileprivate extension Reachability {
  
  func reachabilityChanged() {
    guard previousFlags != flags else { return }
    
    let block = connection != .none ? whenReachable : whenUnreachable
    
    DispatchQueue.main.async {
      block?(self)
      self.notificationCenter.post(name: .reachabilityChanged, object:self)
    }
    
    previousFlags = flags
  }
  
  var isOnWWANFlagSet: Bool {
    #if os(iOS)
      return flags.contains(.isWWAN)
    #else
      return false
    #endif
  }
  var isReachableFlagSet: Bool {
    return flags.contains(.reachable)
  }
  var isConnectionRequiredFlagSet: Bool {
    return flags.contains(.connectionRequired)
  }
  var isInterventionRequiredFlagSet: Bool {
    return flags.contains(.interventionRequired)
  }
  var isConnectionOnTrafficFlagSet: Bool {
    return flags.contains(.connectionOnTraffic)
  }
  var isConnectionOnDemandFlagSet: Bool {
    return flags.contains(.connectionOnDemand)
  }
  var isConnectionOnTrafficOrDemandFlagSet: Bool {
    return !flags.intersection([.connectionOnTraffic, .connectionOnDemand]).isEmpty
  }
  var isTransientConnectionFlagSet: Bool {
    return flags.contains(.transientConnection)
  }
  var isLocalAddressFlagSet: Bool {
    return flags.contains(.isLocalAddress)
  }
  var isDirectFlagSet: Bool {
    return flags.contains(.isDirect)
  }
  var isConnectionRequiredAndTransientFlagSet: Bool {
    return flags.intersection([.connectionRequired, .transientConnection]) == [.connectionRequired, .transientConnection]
  }
  
  var flags: SCNetworkReachabilityFlags {
    var flags = SCNetworkReachabilityFlags()
    if SCNetworkReachabilityGetFlags(reachabilityRef, &flags) {
      return flags
    } else {
      return SCNetworkReachabilityFlags()
    }
  }
}
