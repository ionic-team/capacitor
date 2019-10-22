package com.getcapacitor.plugin.camera;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.getcapacitor.FileUtils;
import com.getcapacitor.LogUtils;

import java.io.IOException;
import java.io.InputStream;

public class ImageUtils {

  /**
   * Resize an image to the given max width and max height. Constraint can be put
   # on one dimension, or both. Resize will always preserve aspect ratio.
   * @param bitmap
   * @param width
   * @param height
   * @return a new, scaled Bitmap
   */
  public static Bitmap resize(Bitmap bitmap, final int desiredMaxWidth, final int desiredMaxHeight) {
    int width = bitmap.getWidth();
    int height = bitmap.getHeight();

    // 0 is treated as 'no restriction'
    int maxHeight = desiredMaxHeight == 0 ? height : desiredMaxHeight;
    int maxWidth = desiredMaxWidth == 0 ? width : desiredMaxWidth;

    // resize with preserved aspect ratio
    float newWidth = Math.min(width, maxWidth);
    float newHeight = (height * newWidth) / width;

    if (newHeight > maxHeight) {
      newWidth = (width * maxHeight) / height;
      newHeight = maxHeight;
    }

    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);

    return Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
  }

  /**
   * Transform an image with the given matrix
   * @param bitmap
   * @param matrix
   * @return
   */
  private static Bitmap transform(final Bitmap bitmap, final Matrix matrix) {
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
  }

  /**
   * Correct the orientation of an image by reading its exif information and rotating
   * the appropriate amount for portrait mode
   * @param bitmap
   * @param imageUri
   * @return
   */
  public static Bitmap correctOrientation(final Context c, final Bitmap bitmap, final Uri imageUri) throws IOException {
    if(Build.VERSION.SDK_INT < 24) {
      return correctOrientationOlder(c, bitmap, imageUri);
    } else {
      final int orientation = getOrientation(c, imageUri);

      if (orientation != 0) {
        Matrix matrix = new Matrix();
        matrix.postRotate(orientation);

        return transform(bitmap, matrix);
      } else {
        return bitmap;
      }
    }
  }

  private static Bitmap correctOrientationOlder(final Context c, final Bitmap bitmap, final Uri imageUri) {
    // TODO: To be tested on older phone using Android API < 24

    String[] orientationColumn = { MediaStore.Images.Media.DATA, MediaStore.Images.Media.ORIENTATION };
    Cursor cur = c.getContentResolver().query(imageUri, orientationColumn, null, null, null);
    int orientation = -1;
    if (cur != null && cur.moveToFirst()) {
      orientation = cur.getInt(cur.getColumnIndex(orientationColumn[0]));
    }
    Matrix matrix = new Matrix();

    if (orientation != -1) {
      matrix.postRotate(orientation);
    }

    return transform(bitmap, matrix);
  }

  private static int getOrientation(final Context c, final Uri imageUri) throws IOException {
    int result = 0;

    InputStream iStream = null;

    try {
      iStream = c.getContentResolver().openInputStream(imageUri);
      final ExifInterface exifInterface = new ExifInterface(iStream);

      final int orientation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);

      if (orientation == ExifInterface.ORIENTATION_ROTATE_90) {
        result = 90;
      } else if (orientation == ExifInterface.ORIENTATION_ROTATE_180) {
        result = 180;
      } else if (orientation == ExifInterface.ORIENTATION_ROTATE_270) {
        result = 270;
      }
    } finally {
       if (iStream != null) {
         iStream.close();
       }
    }

    return result;
  }

  public static ExifWrapper getExifData(final Context c, final Bitmap bitmap, final Uri imageUri) {
    try {
      String fu = FileUtils.getFileUrlForUri(c, imageUri);
      final ExifInterface exifInterface = new ExifInterface(fu);

      return new ExifWrapper(exifInterface);
    } catch (IOException ex) {
      Log.e(LogUtils.getCoreTag(), "Error loading exif data from image", ex);
    } finally {
    }
    return new ExifWrapper(null);
  }
}
