package com.getcapacitor.util;

import android.graphics.Color;

public class WebColor {

    /**
     * Parse the color string, and return the corresponding color-int. If the string cannot be parsed, throws an IllegalArgumentException exception.
     * @param colorString The hexadecimal color string. The format is an RGB or RGBA hex string.
     * @return The corresponding color as an int.
     */
    public static int parseColor(String colorString) {
        if (color.isEmpty()) {
            return 0;
        }

        // Color.parseColor() reads colors as ARGB instead of RGBA, which is the CSS standard. Brilliant!
        // So we have to move the alpha value if it exists. Also, if the color does not have a "#" prefix
        // (which is allowed on iOS), add it, because parseColor() expects it.
        if (color.length() > 1) {
            if (color.charAt(0) == '#') {
              color = color.substring(1);
            }

            switch (color.length()) {
                // If the length is 3 or 4, assume it's RGB[A], convert to RRGGBB[AA]
                case 3:
                case 4:
                  StringBuilder rgb = new StringBuilder();

                  for (int i = 0; i < color.length(); i++) {
                    String ch = color.substring(i, i + 1);
                    rgb.append(ch).append(ch);
                  }

                  color = rgb.toString();
                  break;
            }

            if (color.length() == 8) {
                // If the length is 8, assume it's RRGGBBAA
                color = color.substring(6) + color.substring(0, 6);
            }

            color = "#" + color;
        }

        return Color.parseColor(color);
}
