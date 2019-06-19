extension UIColor {
  convenience init(r: Int, g: Int, b: Int, a: Int = 0xFF) {
    self.init(
      red: CGFloat(r) / 255.0,
      green: CGFloat(g) / 255.0,
      blue: CGFloat(b) / 255.0,
      alpha: CGFloat(a) / 255.0
    )
  }

  convenience init(argb: UInt32) {
    self.init(
      red: CGFloat((argb >> 16) & 0xFF),
      green: CGFloat((argb >> 8) & 0xFF),
      blue: CGFloat(argb & 0xFF),
      alpha: CGFloat((argb >> 24) & 0xFF)
    )
  }

  convenience init?(fromHex: String) {
    let hexString = fromHex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(
      of: "#",
      with: ""
    )

    var argb: UInt32 = 0

    var r: CGFloat = 0.0
    var g: CGFloat = 0.0
    var b: CGFloat = 0.0
    var a: CGFloat = 1.0

    guard Scanner(string: hexString).scanHexInt32(&argb) else { return nil }

    if hexString.count == 6 {
      r = CGFloat((argb & 0xFF0000) >> 16) / 255.0
      g = CGFloat((argb & 0x00FF00) >> 8) / 255.0
      b = CGFloat(argb & 0x0000FF) / 255.0

    } else if hexString.count == 8 {
      r = CGFloat((argb & 0xFF00_0000) >> 24) / 255.0
      g = CGFloat((argb & 0x00FF0000) >> 16) / 255.0
      b = CGFloat((argb & 0x0000FF00) >> 8) / 255.0
      a = CGFloat(argb & 0x000000FF) / 255.0

    } else {
      return nil
    }

    self.init(red: r, green: g, blue: b, alpha: a)
  }
}
