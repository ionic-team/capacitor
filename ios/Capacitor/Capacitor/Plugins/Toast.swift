import Foundation



@objc(CAPToastPlugin)
public class CAPToastPlugin : CAPPlugin {

  @objc func show(_ call: CAPPluginCall) {
    guard let text = call.get("text", String.self) else {
      call.error("text must be provided and must be a string.")
      return
    }
    let durationType = call.get("duration", String.self, "short")!
    let duration = durationType == "long" ? 3500 : 2000
    let position = call.get("position", String.self, "bottom")

    showToast(vc: self.bridge!.viewController, text: text, duration: duration, position: position!, completion: {(isCompleted) in
      call.success()
    });
  }
  
  public func showToast(vc: UIViewController, text: String, duration: Int = 2000, position: String = "bottom", completion: ((Bool) -> Void)? = nil) {
    DispatchQueue.main.async {
      let maxSizeTitle : CGSize = CGSize(width: vc.view.bounds.size.width-32, height: vc.view.bounds.size.height)
      
      let lb = UILabel()
      lb.backgroundColor = UIColor.black.withAlphaComponent(0.6)
      lb.textColor = UIColor.white
      lb.textAlignment = .center
      lb.text = text
      lb.alpha = 0
      lb.layer.cornerRadius = 18
      lb.clipsToBounds  =  true
      lb.lineBreakMode = .byWordWrapping
      lb.numberOfLines = 0
      
      var expectedSizeTitle : CGSize = lb.sizeThatFits(maxSizeTitle)
      // UILabel can return a size larger than the max size when the number of lines is 1
      let minWidth = min(maxSizeTitle.width, expectedSizeTitle.width)
      let minHeight = min(maxSizeTitle.height, expectedSizeTitle.height)
      expectedSizeTitle = CGSize(width: minWidth, height: minHeight)
        
      let height = expectedSizeTitle.height+32
      let y: CGFloat
      if (position == "top") {
        y = 40
      } else if (position == "center") {
        y = (vc.view.bounds.size.height/2) - (height/2)
      } else {
        y = vc.view.bounds.size.height - height - (height/2)
      }

      lb.frame = CGRect(
        x: ((vc.view.bounds.size.width)/2) - ((expectedSizeTitle.width+32)/2),
        y: y,
        width: expectedSizeTitle.width+32,
        height: height)
      
      lb.padding = UIEdgeInsets(top: 8, left: 8, bottom: 8, right: 8)

      vc.view.addSubview(lb)
      
      UIView.animateKeyframes(withDuration: 0.3, delay: 0, animations: {
        lb.alpha = 1.0
      }, completion: {(isCompleted) in
       
        UIView.animate(withDuration: 0.3, delay: (Double(duration) / 1000), options: .curveEaseOut, animations: {
          lb.alpha = 0.0
        }, completion: {(isCompleted) in
          lb.removeFromSuperview()

          if (completion) != nil {
            completion?(isCompleted);
          }
        })
      })
    }
  }
}
