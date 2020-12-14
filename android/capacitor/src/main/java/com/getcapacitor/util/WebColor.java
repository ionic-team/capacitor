package com.getcapacitor.util;

import android.graphics.Color;

public class WebColor {

    /**
     * Parse the color string, and return the corresponding color-int. If the string cannot be parsed, throws an IllegalArgumentException exception.
     * @param colorString The hexadecimal color string. The format is an RGB or RGBA hex string.
     * @return The corresponding color as an int.
     */
    public static int parseColor(String colorString) {
        String formattedColor = colorString;
        if (colorString.charAt(0) != '#') {
            formattedColor = "#" + formattedColor;
        }

        if (formattedColor.length() != 7 && formattedColor.length() != 9) {
            throw new IllegalArgumentException("The encoded color space is invalid or unknown");
        } else if (formattedColor.length() == 7) {
            return Color.parseColor(formattedColor);
        } else {
            // Convert to Android format #AARRGGBB from #RRGGBBAA
            formattedColor = "#" + formattedColor.substring(7) + formattedColor.substring(1, 7);
            return Color.parseColor(formattedColor);
        }
    }
}
