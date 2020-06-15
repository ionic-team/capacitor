/**
 * Portions adopted from react-native-image-crop-picker
 *
 * MIT License

 * Copyright (c) 2017 Ivan Pusic

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.getcapacitor;

import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

/**
 * Common File utilities, such as resolve content URIs and
 * creating portable web paths from low-level files
 */
public class FileUtils {

  private static String CapacitorFileScheme = Bridge.CAPACITOR_FILE_START;

  public enum Type {
    IMAGE("image");
    private String type;
    Type(String type) {
      this.type = type;
    }
  }

  public static String getPortablePath(Context c, String host, Uri u) {
    String path = getFileUrlForUri(c, u);
    if (path.startsWith("file://")) {
      path = path.replace("file://", "");
    } else if (path.startsWith("/")) {
      path = path;
    }
    return host + Bridge.CAPACITOR_FILE_START + path;
  }

  public static String getFileUrlForUri(final Context context, final Uri uri) {

    // DocumentProvider
    if (DocumentsContract.isDocumentUri(context, uri)) {
      // ExternalStorageProvider
      if (isExternalStorageDocument(uri)) {
        final String docId = DocumentsContract.getDocumentId(uri);
        final String[] split = docId.split(":");
        final String type = split[0];

        if ("primary".equalsIgnoreCase(type)) {
          return Environment.getExternalStorageDirectory() + "/" + split[1];
        } else {
          final int splitIndex = docId.indexOf(':', 1);
          final String tag = docId.substring(0, splitIndex);
          final String path = docId.substring(splitIndex + 1);

          String nonPrimaryVolume = getPathToNonPrimaryVolume(context, tag);
          if (nonPrimaryVolume != null) {
            String result = nonPrimaryVolume + "/" + path;
            File file = new File(result);
            if (file.exists() && file.canRead()) {
              return result;
            }
            return null;
          }
        }
      }
      // DownloadsProvider
      else if (isDownloadsDocument(uri)) {

        final String id = DocumentsContract.getDocumentId(uri);
        final Uri contentUri = ContentUris.withAppendedId(
            Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));

        return getDataColumn(context, contentUri, null, null);
      }
      // MediaProvider
      else if (isMediaDocument(uri)) {
        final String docId = DocumentsContract.getDocumentId(uri);
        final String[] split = docId.split(":");
        final String type = split[0];

        Uri contentUri = null;
        if ("image".equals(type)) {
          contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        } else if ("video".equals(type)) {
          contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
        } else if ("audio".equals(type)) {
          contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        }

        final String selection = "_id=?";
        final String[] selectionArgs = new String[] {
            split[1]
        };

        return getDataColumn(context, contentUri, selection, selectionArgs);
      }
    }
    // MediaStore (and general)
    else if ("content".equalsIgnoreCase(uri.getScheme())) {

      // Return the remote address
      if (isGooglePhotosUri(uri))
        return uri.getLastPathSegment();
      return getDataColumn(context, uri, null, null);
    }
    // File
    else if ("file".equalsIgnoreCase(uri.getScheme())) {
      return uri.getPath();
    }

    return null;
  }

  /**
   * Get the value of the data column for this Uri. This is useful for
   * MediaStore Uris, and other file-based ContentProviders.
   *
   * @param context The context.
   * @param uri The Uri to query.
   * @param selection (Optional) Filter used in the query.
   * @param selectionArgs (Optional) Selection arguments used in the query.
   * @return The value of the _data column, which is typically a file path.
   */
  private static String getDataColumn(Context context, Uri uri, String selection,
                                      String[] selectionArgs) {
    String path = null;
    Cursor cursor = null;
    final String column = "_data";
    final String[] projection = {
        column
    };

    try {
      cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs,
          null);
      if (cursor != null && cursor.moveToFirst()) {
        final int index = cursor.getColumnIndexOrThrow(column);
        path = cursor.getString(index);
      }
    } catch (IllegalArgumentException ex) {
      return getCopyFilePath(uri, context);
    } finally {
      if (cursor != null)
        cursor.close();
    }
    if (path == null) {
      return getCopyFilePath(uri, context);
    }
    return path;
  }

  private static String getCopyFilePath(Uri uri, Context context) {
    Cursor cursor = context.getContentResolver().query(uri, null, null, null, null);
    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
    cursor.moveToFirst();
    String name = (cursor.getString(nameIndex));
    File file = new File(context.getFilesDir(), name);
    try {
      InputStream inputStream = context.getContentResolver().openInputStream(uri);
      FileOutputStream outputStream = new FileOutputStream(file);
      int read = 0;
      int maxBufferSize = 1024 * 1024;
      int bufferSize = Math.min(inputStream.available(), maxBufferSize);
      final byte[] buffers = new byte[bufferSize];
      while ((read = inputStream.read(buffers)) != -1) {
        outputStream.write(buffers, 0, read);
      }
      inputStream.close();
      outputStream.close();
    } catch (Exception e) {
      return null;
    } finally {
      if (cursor != null)
        cursor.close();
    }
    return file.getPath();
  }


  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is ExternalStorageProvider.
   */
  private static boolean isExternalStorageDocument(Uri uri) {
    return "com.android.externalstorage.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is DownloadsProvider.
   */
  private static boolean isDownloadsDocument(Uri uri) {
    return "com.android.providers.downloads.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is MediaProvider.
   */
  private static boolean isMediaDocument(Uri uri) {
    return "com.android.providers.media.documents".equals(uri.getAuthority());
  }

  /**
   * @param uri The Uri to check.
   * @return Whether the Uri authority is Google Photos.
   */
  private static boolean isGooglePhotosUri(Uri uri) {
    return "com.google.android.apps.photos.content".equals(uri.getAuthority());
  }

  private static String getPathToNonPrimaryVolume(Context context, String tag) {
    File[] volumes = context.getExternalCacheDirs();
    if (volumes != null) {
      for (File volume : volumes) {
        if (volume != null) {
          String path = volume.getAbsolutePath();
          if (path != null) {
            int index = path.indexOf(tag);
            if (index != -1) {
              return path.substring(0, index) + tag;
            }
          }
        }
      }
    }
    return null;
  }

}
