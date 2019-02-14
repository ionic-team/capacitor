extension UILabel {
  private struct AssociatedKeys {
    static var padding = UIEdgeInsets()
  }
  
  public var padding: UIEdgeInsets? {
    get {
      return objc_getAssociatedObject(self, &AssociatedKeys.padding) as? UIEdgeInsets
    }
    set {
      if let newValue = newValue {
        objc_setAssociatedObject(self, &AssociatedKeys.padding, newValue as UIEdgeInsets, objc_AssociationPolicy.OBJC_ASSOCIATION_RETAIN_NONATOMIC)
      }
    }
  }
  
  override open func draw(_ rect: CGRect) {
    if let insets = padding {
      self.drawText(in: rect.inset(by: insets))
    } else {
      self.drawText(in: rect)
    }
  }
}
