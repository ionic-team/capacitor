package android.text;

public class TextUtils {

    public static String join(CharSequence delimiter, Object[] tokens) {
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < tokens.length; i++) {
            if (i > 0) {
                builder.append(delimiter);
            }
            builder.append(tokens[i]);
        }

        return builder.toString();
    }
}
