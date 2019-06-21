import Foundation

@objc(CAPBackgroundTaskPlugin)
public class CAPBackgroundTaskPlugin : CAPPlugin {
  var tasks: [String:UIBackgroundTaskIdentifier] = [:]
  
  public override func load() {
    NotificationCenter.default.addObserver(self, selector: #selector(self.onAppTerminate), name: UIApplication.willTerminateNotification, object: nil)
    //NotificationCenter.default.addObserver(self, selector: #selector(self.onAppBackgrounded), name: NSNotification.Name.UIApplicationDidEnterBackground, object: nil)
  }
  
  @objc func beforeExit(_ call: CAPPluginCall) {
    var taskId: UIBackgroundTaskIdentifier = UIBackgroundTaskIdentifier.invalid
    
    taskId = UIApplication.shared.beginBackgroundTask {
      UIApplication.shared.endBackgroundTask(taskId)
      self.tasks[call.callbackId] = UIBackgroundTaskIdentifier.invalid
    }
    
    self.tasks[call.callbackId] = taskId
    call.success()
  }
  
  @objc func finish(_ call: CAPPluginCall) {
    guard let callbackTaskId = call.getString("taskId") else {
      call.error("Must provide taskId returned from calling start()")
      return
    }
    
    guard let taskId = tasks[callbackTaskId] else {
      call.error("No such task found")
      return
    }
    
    UIApplication.shared.endBackgroundTask(taskId)
  }

  
  @objc func fetch(_ call: CAPPluginCall) {
   
  }
  
  @objc func onAppTerminate() {
    CAPLog.print("APP TERMINATING IN BACKGROUND TASK")
  }
}



