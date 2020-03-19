package com.getcapacitor.plugin.filesystem;

import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import java.io.File;

public class FilesystemUtils {
  public static final String DIRECTORY_DOCUMENTS = "DOCUMENTS";
  public static final String DIRECTORY_APPLICATION = "APPLICATION";
  public static final String DIRECTORY_DOWNLOADS = "DOWNLOADS";
  public static final String DIRECTORY_DATA = "DATA";
  public static final String DIRECTORY_CACHE = "CACHE";
  public static final String DIRECTORY_EXTERNAL = "EXTERNAL";
  public static final String DIRECTORY_EXTERNAL_STORAGE = "EXTERNAL_STORAGE";

  public static File getFileObject(Context c, String path, String directory) {
    if (directory == null) {
      Uri u = Uri.parse(path);
      if (u.getScheme() == null || u.getScheme().equals("file")) {
        return new File(u.getPath());
      }
    }

    File androidDirectory = FilesystemUtils.getDirectory(c, directory);

    if (androidDirectory == null) {
      return null;
    } else {
      if(!androidDirectory.exists()) {
        androidDirectory.mkdir();
      }
    }

    return new File(androidDirectory, path);
  }

  public static File getDirectory(Context c, String directory) {
    switch(directory) {
      case DIRECTORY_APPLICATION:
        return c.getFilesDir();
      case DIRECTORY_DOCUMENTS:
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
      case DIRECTORY_DOWNLOADS:
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
      case DIRECTORY_DATA:
        return c.getFilesDir();
      case DIRECTORY_CACHE:
        return c.getCacheDir();
      case DIRECTORY_EXTERNAL:
        return c.getExternalFilesDir(null);
      case DIRECTORY_EXTERNAL_STORAGE:
        return Environment.getExternalStorageDirectory();
    }
    return null;
  }

  /**
   * True if the given directory string is a public storage directory, which is accessible by the user or other apps.
   * @param directory the directory string.
   */
  public static boolean isPublicDirectory(String directory) {
    return DIRECTORY_DOCUMENTS.equals(directory) ||
           DIRECTORY_DOWNLOADS.equals(directory) ||
           "EXTERNAL_STORAGE".equals(directory);
  }
}
