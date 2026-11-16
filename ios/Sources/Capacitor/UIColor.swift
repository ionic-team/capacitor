extension UIColor: CapacitorExtension {}
public extension CapacitorExtensionTypeWrapper where T: UIColor {
    // disable linting for the short variable names, since that's the point of the method
    // swiftlint:disable:next identifier_name
    static func color(r: Int, g: Int, b: Int, a: Int = 0xFF) -> UIColor {
        return T(
            red: CGFloat(r) / 255.0,
            green: CGFloat(g) / 255.0,
            blue: CGFloat(b) / 255.0,
            alpha: CGFloat(a) / 255.0
        )
    }

    static func color(argb: UInt32) -> UIColor {
        return T(
            red: CGFloat((argb >> 16) & 0xFF),
            green: CGFloat((argb >> 8) & 0xFF),
            blue: CGFloat(argb & 0xFF),
            alpha: CGFloat((argb >> 24) & 0xFF)
        )
    }

    static func color(fromHex: String) -> UIColor? {
        let hexString = fromHex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(
            of: "#",
            with: ""
        )

        var argb: UInt64 = 0

        var red: CGFloat = 0.0
        var green: CGFloat = 0.0
        var blue: CGFloat = 0.0
        var alpha: CGFloat = 1.0

        guard Scanner(string: hexString).scanHexInt64(&argb) else { return nil }

        if hexString.count == 6 {
            red = CGFloat((argb & 0xFF0000) >> 16) / 255.0
            green = CGFloat((argb & 0x00FF00) >> 8) / 255.0
            blue = CGFloat(argb & 0x0000FF) / 255.0

        } else if hexString.count == 8 {
            red = CGFloat((argb & 0xFF00_0000) >> 24) / 255.0
            green = CGFloat((argb & 0x00FF0000) >> 16) / 255.0
            blue = CGFloat((argb & 0x0000FF00) >> 8) / 255.0
            alpha = CGFloat(argb & 0x000000FF) / 255.0

        } else {
            return nil
        }

        return T(red: red, green: green, blue: blue, alpha: alpha)
    }
}
