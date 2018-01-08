/*
import Foundation

@IBDesignable class UIPaddingLabel: UILabel {
  
  private var _padding:CGFloat = 0.0;
  
  public var padding:CGFloat {
    
    get { return _padding; }
    set {
      _padding = newValue;
      
      paddingTop = _padding;
      paddingLeft = _padding;
      paddingBottom = _padding;
      paddingRight = _padding;
    }
  }
  
  @IBInspectable var paddingTop:CGFloat = 0.0;
  @IBInspectable var paddingLeft:CGFloat = 0.0;
  @IBInspectable var paddingBottom:CGFloat = 0.0;
  @IBInspectable var paddingRight:CGFloat = 0.0;
  
  override func drawText(in rect: CGRect) {
    let insets = UIEdgeInsets(top:paddingTop, left:paddingLeft, bottom:paddingBottom, right:paddingRight);
    super.drawText(in: UIEdgeInsetsInsetRect(rect, insets));
  }
  
  override var intrinsicContentSize: CGSize {
    
    get {
      var intrinsicSuperViewContentSize = super.intrinsicContentSize;
      intrinsicSuperViewContentSize.height += paddingTop + paddingBottom;
      intrinsicSuperViewContentSize.width += paddingLeft + paddingRight;
      return intrinsicSuperViewContentSize;
    }
  }
}

@objc(Toast)
public class Toast : Plugin {
  @objc func show(_ call: CAPPluginCall) {
    guard let text = call.get("text", String.self) else {
      call.error("text must be provided and must be a string.")
      return
    }
    let durationStyle = call.get("durationStyle", String.self, "short")!
    let duration = durationStyle == "short" ? 1000 : 5000
    
    let toastLabel = UIPaddingLabel();
    toastLabel.padding = 10;
    toastLabel.translatesAutoresizingMaskIntoConstraints = false;
    toastLabel.backgroundColor = UIColor.darkGray;
    toastLabel.textColor = UIColor.white;
    toastLabel.textAlignment = .center;
    toastLabel.text = text;
    toastLabel.numberOfLines = 0;
    toastLabel.alpha = 0.9;
    toastLabel.layer.cornerRadius = 20;
    toastLabel.clipsToBounds = true;
    
    let vc = self.bridge.viewController
    
    vc.view.addSubview(toastLabel);
    
    vc.view.addConstraint(NSLayoutConstraint(item:toastLabel, attribute:.left, relatedBy:.greaterThanOrEqual, toItem:self, attribute:.left, multiplier:1, constant:20));
    vc.view.addConstraint(NSLayoutConstraint(item:toastLabel, attribute:.right, relatedBy:.lessThanOrEqual, toItem:self, attribute:.right, multiplier:1, constant:-20));
    vc.view.addConstraint(NSLayoutConstraint(item:toastLabel, attribute:.bottom, relatedBy:.equal, toItem:self, attribute:.bottom, multiplier:1, constant:-20));
    vc.view.addConstraint(NSLayoutConstraint(item:toastLabel, attribute:.centerX, relatedBy:.equal, toItem:self, attribute:.centerX, multiplier:1, constant:0));
    
    UIView.animate(withDuration:0.5, delay:Double(duration) / 1000.0, options:[], animations: {
      
      toastLabel.alpha = 0.0;
      
    }) { (Bool) in
      
      toastLabel.removeFromSuperview();
    }
  }
}
 */


