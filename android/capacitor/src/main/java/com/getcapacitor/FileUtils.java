package com.getcapacitor;

import android.net.Uri;

public class FileUtils {

  public static String getPortablePath(Uri u) {
    String path = u.toString();
    if (u.getScheme().equals("content")) {
      path = path.replace("content://", "/");
    } else if (u.getScheme().equals("file")) {
      path = path.replace("file://", "");
    }
    return "_capacitor_" + path;
  }
}
