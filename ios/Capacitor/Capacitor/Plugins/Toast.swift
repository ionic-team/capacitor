import Foundation

@objc(CAPToastPlugin)
public class CAPToastPlugin : CAPPlugin {
  @objc func show(_ call: CAPPluginCall) {
    guard let text = call.get("text", String.self) else {
      call.error("text must be provided and must be a string.")
      return
    }
    let durationStyle = call.get("durationStyle", String.self, "short")!
    let duration = durationStyle == "short" ? 1000 : 5000
    
    DispatchQueue.main.async {
      let vc = self.bridge!.viewController
      
      let toastLabel = UILabel(frame: CGRect(x: vc.view.frame.size.width/2 - 75, y: vc.view.frame.size.height-100, width: 150, height: 35))
      toastLabel.backgroundColor = UIColor.black.withAlphaComponent(0.6)
      toastLabel.textColor = UIColor.white
      toastLabel.textAlignment = .center;
      toastLabel.font = UIFont(name: "Montserrat-Light", size: 12.0)
      toastLabel.text = text
      toastLabel.alpha = 0
      toastLabel.layer.cornerRadius = 10;
      toastLabel.clipsToBounds  =  true
      vc.view.addSubview(toastLabel)
      
      UIView.animate(withDuration: 0.3, delay: 0, options: .curveEaseIn, animations: {
        toastLabel.alpha = 1.0
      }, completion: {(isCompleted) in
        DispatchQueue.main.async {
          UIView.animate(withDuration: 1000, delay: Double(duration)/1000, options: .curveEaseOut, animations: {
            toastLabel.alpha = 0.0
          }, completion: {(isCompleted) in
            toastLabel.removeFromSuperview()
          })
        }
      })
    }
  }
}



