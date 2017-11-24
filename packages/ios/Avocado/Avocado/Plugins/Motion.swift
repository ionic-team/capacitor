import Foundation
import CoreMotion

public class Motion : Plugin {
  var motion: CMMotionManager?
  var timer: Timer?
  
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.motion")
  }
  
  @objc func watchAccel(_ call: PluginCall) {
    self.motion = CMMotionManager()
    
    if self.motion!.isAccelerometerAvailable {
      self.motion!.accelerometerUpdateInterval = 1.0 / 60.0  // 60 Hz
      self.motion!.startAccelerometerUpdates()
      
      // Configure a timer to fetch the data.
      self.timer = Timer(fire: Date(), interval: (1.0/60.0), repeats: true, block: { (timer) in
        // Get the accelerometer data.
        if let data = self.motion!.accelerometerData {
          let x = data.acceleration.x
          let y = data.acceleration.y
          let z = data.acceleration.z
          
          call.success([
            "x": x,
            "y": y,
            "z": z
          ])
        }
      })
      
      // Add the timer to the current run loop.
      RunLoop.current.add(self.timer!, forMode: .defaultRunLoopMode)
    } else {
      call.error("Accelerometer isn't available.", nil)
    }
  }
}
