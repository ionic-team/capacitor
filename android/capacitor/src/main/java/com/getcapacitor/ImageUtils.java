package com.getcapacitor;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;

public class ImageUtils {
  /**
   * Resize an image to the given width and height. Leave one dimension 0 to
   * perform an aspect-ratio scale on the provided dimension.
   * @param bitmap
   * @param width
   * @param height
   * @return a new, scaled Bitmap
   */
  public static Bitmap resize(Bitmap bitmap, int width, int height) {
    float aspect = bitmap.getWidth() / (float) bitmap.getHeight();
    if (width > 0 && height > 0) {
      return Bitmap.createScaledBitmap(bitmap, width, height, false);
    } else if (width > 0) {
      return Bitmap.createScaledBitmap(bitmap, width, (int) (width * 1/aspect), false);
    } else if (height > 0) {
      return Bitmap.createScaledBitmap(bitmap, (int)(height * 1/aspect), height, false);
    }

    return bitmap;
  }

  /**
   * Transform an image with the given matrix
   * @param bitmap
   * @param matrix
   * @return
   */
  public static Bitmap transform(Bitmap bitmap, Matrix matrix) {
    return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
  }

  /**
   * Correct the orientation of an image by reading its exif information and rotating
   * the appropriate amount for portrait mode
   * @param bitmap
   * @param imageUri
   * @return
   */
  public static Bitmap correctOrientation(Context c, Bitmap bitmap, Uri imageUri) {
    String[] orientationColumn = { MediaStore.Images.Media.ORIENTATION };
    Cursor cur = c.getContentResolver().query(imageUri, orientationColumn, null, null, null);
    int orientation = -1;
    if (cur != null && cur.moveToFirst()) {
      orientation = cur.getInt(cur.getColumnIndex(orientationColumn[0]));
    }
    Matrix matrix = new Matrix();
    matrix.postRotate(orientation);

    return transform(bitmap, matrix);
  }
}
