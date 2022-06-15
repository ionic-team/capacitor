package com.getcapacitor;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.appcompat.app.AppCompatActivity;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Objects;
import java.util.UUID;

public final class AppUUID {

    private static final String KEY = "CapacitorAppUUID";

    public static String getAppUUID(AppCompatActivity activity) throws Exception {
        assertAppUUID(activity);
        return readUUID(activity);
    }

    public static void regenerateAppUUID(AppCompatActivity activity) throws Exception {
        try {
            String uuid = generateUUID();
            writeUUID(activity, uuid);
        } catch (NoSuchAlgorithmException ex) {
            throw new Exception("Capacitor App UUID could not be generated.");
        }
    }

    private static void assertAppUUID(AppCompatActivity activity) throws Exception {
        String uuid = readUUID(activity);
        if (uuid.equals("")) {
            regenerateAppUUID(activity);
        }
    }

    private static String generateUUID() throws NoSuchAlgorithmException {
        MessageDigest salt = MessageDigest.getInstance("SHA-256");
        salt.update(UUID.randomUUID().toString().getBytes(StandardCharsets.UTF_8));
        return bytesToHex(salt.digest());
    }

    private static String readUUID(AppCompatActivity activity) {
        SharedPreferences sharedPref = activity.getPreferences(Context.MODE_PRIVATE);
        return sharedPref.getString(KEY, "");
    }

    private static void writeUUID(AppCompatActivity activity, String uuid) {
        SharedPreferences sharedPref = activity.getPreferences(Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(KEY, uuid);
        editor.apply();
    }

    private static String bytesToHex(byte[] bytes) {
        byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes(StandardCharsets.US_ASCII);
        byte[] hexChars = new byte[bytes.length * 2];
        for (int j = 0; j < bytes.length; j++) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = HEX_ARRAY[v >>> 4];
            hexChars[j * 2 + 1] = HEX_ARRAY[v & 0x0F];
        }
        return new String(hexChars, StandardCharsets.UTF_8);
    }
}
