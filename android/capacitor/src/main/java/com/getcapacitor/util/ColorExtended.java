package main.java.com.getcapacitor.util;

import android.graphics.Color;

public class ColorExtended extends Color {
    public enum ColorFormat {
        RGB,
        RGBA,
        ARGB,
        // Add support for HSV in the future?
    }

    /**
     * Parse the color string, and return the corresponding color-int. If the string cannot be parsed, throws an IllegalArgumentException exception.
     * @param colorString The hexadecimal color string.
     * @param incomingFormat The format that the hex string is in.
     * @return The corresponding color as an int.
     */
    public static int parseColor(String colorString, ColorFormat incomingFormat) {
        if (incomingFormat == ColorFormat.RGB || incomingFormat == ColorFormat.ARGB) {
            return Color.parseColor(colorString);
        } else {
            if (colorString.length() != 9) {
                throw new IllegalArgumentException("The encoded color space is invalid or unknown");
            }

            // Format should be #RRGGBBAA at this point, convert to #AARRGGBB
            String reformattedString = "#" + colorString.substring(7) + colorString.substring(1, 7);
            return Color.parseColor(reformattedString);
        }
    }
}
